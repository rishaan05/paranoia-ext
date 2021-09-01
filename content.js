

function inject(fn) {	
	const script = document.createElement('script')
	script.text = `(${fn.toString()})();`
	document.documentElement.appendChild(script)
}



function checkKey(key){

	chrome.storage.local.get(['hwid','config','cache'],function({hwid}){

		const cache = localStorage.getItem('cache')
		if(cache && (Date.now() - cache) < 45000){
			return inject(runAll)
		}

		if(!hwid) return
		return fetch(`https://paranoia-auth-server.herokuapp.com/curie?key=${key}&hwid=${hwid}`).then(r=>{
			r.json().then(t=>{
				const authData = JSON.parse(decodeURIComponent(atob(t.data.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')).split('').map(function(c) {return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);}).join('')));
				if(authData.status === "success"){
					inject(runAll)
					localStorage.setItem('cache',Date.now())
				} else if(authData.status === "activated"){
					alert('Key Already Activated')
				} else if(authData.status === "invalid"){
					alert('Invalid Key')
					chrome.storage.local.remove(["key"],function(){})
				}
			})
		}).catch(e=>{
			alert('Invalid Key')
		})

    })

}


chrome.storage.local.get(['key'],function(data){
	if(data.key){
		checkKey(data.key);
	}
})




//linesplit


function runAll(){
	window.yummyacoAssets = (self)=>{
		triggerOnPageChange(self.parentElement.parentElement.parentElement.parentElement.href,aco)
	}
	window.yummyPageAco = ()=>{
		aco()
	}

	window.yummyListingAco = (self)=>{
		self.parentElement.parentElement.querySelector('button[data-testid=OrderCheckoutButton]').click()
		listingaco()
	}

	window.yummyacoAssets = (self)=>{
		triggerOnPageChange(self.parentElement.parentElement.parentElement.parentElement.href,aco)
	}
	window.yummyacoVolume = (self)=>{
		const urlEl = self.parentElement.parentElement.querySelector('a')
		triggerOnPageChange(urlEl.href,aco)
		urlEl.click()
	}
	function addButtons(){
		Array.from(document.getElementsByClassName('AssetCardFooter--annotations')).forEach(el => {
			if (!el.querySelector('.yummy-button')) {
				const button = document.createElement('div')
				button.className = "yummy-button"
				button.innerHTML = `<button onclick="window.yummyacoAssets(this)">QuickPurchase</button>`
				el.appendChild(button)
			}
		})
		Array.from(document.getElementsByClassName('Row--cell Row--cellIsSpaced EventHistory--item-col')).slice(1).forEach(el => {
			if (!el.querySelector('.yummy-button')) {
				const button = document.createElement('div')
				button.className = "yummy-button"
				button.innerHTML = `<button onclick="window.yummyacoVolume(this)">QuickPurchase</button>`
				el.appendChild(button)
			}
		})
		const pageButton = document.getElementsByClassName('TradeStation--main')[0]?.querySelector('button').parentElement
		if(pageButton){
			if(!pageButton.querySelector('.yummy-button')){
				const button = document.createElement('div')
				button.className = "yummy-button"
				button.innerHTML = `<button onclick="window.yummyPageAco(this)">QuickPurchase</button>`
				pageButton.appendChild(button)
			}

		}

		const listingButtons = document.querySelectorAll('button[data-testid=OrderCheckoutButton]')
		if(listingButtons){
			[...listingButtons].forEach(el => {
				const parent = el?.parentElement?.parentElement?.parentElement?.parentElement
				if(parent){
					if(!parent.querySelector('.short-yummy-button')){
						const button = document.createElement('div')
						button.height = "10px"
						button.className = "short-yummy-button"
						button.innerHTML = `<button onclick="window.yummyListingAco(this)">QuickPurchase</button>`
						parent.appendChild(button)

					}
				
				}
			})
		}
		
			
	}
	function reviewInfo(){
		const btn = document.getElementById('review-confirmation')
		try{
			if(btn){
				btn.click()
				return
			}
		}catch{}
		setTimeout(reviewInfo,50)
	}
	function clickLoop(innerText){
		const btn = [...document.querySelectorAll('button')].find(el=>el.innerText.toLowerCase().includes(innerText))
		try{
			if(btn){
				btn.click()
				return
			}
		}catch{}
		setTimeout(function(){clickLoop(innerText)},50)
	}
	function aco(){
		clickLoop('buy now')
		reviewInfo()
		clickLoop('checkout')
	}

	function listingaco(){
		reviewInfo()
		clickLoop('checkout')
	}
	setInterval(addButtons,100)
	function triggerOnPageChange(url,callback){
		if(url === window.location.href){
			callback()
			return
		}
		setTimeout(function(){
			triggerOnPageChange(url,callback)
		},100)
	}


	function notify(webhookURL,{name,url,price,image}){

		fetch(webhookURL,{
			method:'POST',
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				"content": null,
				"embeds": [
				  {
					"title": "Product Found",
					"color": 16711423,
					"fields": [
					  {
						"name": "Item",
						"value": `[${name}](${url})`,
						"inline": true
					  },
					  {
						"name": "Price",
						"value": price,
						"inline": true
					  }
					],
					"author": {
					  "name": "Paranoia",
					  "url": "https://twitter.com/paranoia_v1"
					},
					"footer": {
					  "text": "Paranoia | v1.0",
					  "icon_url": "https://pbs.twimg.com/profile_images/1415955135843295233/QbJqhIyh_400x400.jpg"
					},
					"thumbnail": {
					  "url": image
					}
				  }
				]
			  })
		})
		
	}


	async function listingMode(limit,webhookURL){
		const scrollbox = document.getElementsByClassName('Scrollboxreact__DivContainer-sc-1b04elr-0 ddtCpj EventHistory--container ActivitySearch--event-history-scrollbox')[0].querySelector('.Scrollbox--content')

		let listings = [...document.getElementsByClassName('EventHistory--row')]
		while(listings.length < 10){
			listings = [...document.getElementsByClassName('EventHistory--row')]
			scrollbox.scrollBy(0,250)
			await new Promise(resolve => setTimeout(resolve, 150));
		}
		if(listings.some(el=>{
			if(el.querySelector('.Price--eth-icon')){
				const price = el.querySelector('.Price--amount').innerText
				const timestamp = el.querySelector('div[data-testid=EventTimestamp]').querySelector('span').innerText
				if(timestamp.includes('a minute ago') || timestamp.includes('second')){
					if(Number(price)<=Number(limit)){
						if(webhookURL){	
							notify(webhookURL,{
								name: el.querySelector('.AssetCell--name').innerText,
								url: el.querySelector('.AssetCell--link').href,
								price: price,
								image: el.querySelector('.Image--image').src
							})
						}
						el.querySelector('.yummy-button').querySelector('button').click()
						return true
					}
				}

			}
	

		})){return}
		

		setTimeout(function(){
			window.location.reload()
		}, 1000);


	}
	window.addEventListener("load", function(){
		const sheet = document.createElement('style')
		sheet.innerHTML = `
		
		
		.short-yummy-button {
			overflow-x: hidden;
			background-color: #2181e3;
			height: 25px;
			border-radius: 5px;
			width: 100px;
		}
		
		.short-yummy-button>button {
			font-family: Poppins, sans-serif;
			font-size: 10px;
			color: #fff;
			background-color: #2181e3;
			height: 100%;
			width: 100%
		}
		
		.short-yummy-button>button:hover {
			background-color: #1969b7
		}

		.yummy-button {
			overflow-x: hidden;
			background-color: #2181e3;
			height: 50px;
			border-radius: 5px;
			width: 100%
		}
		
		.yummy-button>button {
			font-family: Poppins, sans-serif;
			font-size: 20px;
			color: #fff;
			background-color: #2181e3;
			height: 100%;
			width: 100%
		}
		
		.yummy-button>button:hover {
			background-color: #1969b7
		}`;
		document.body.appendChild(sheet);
		try{
			const config = JSON.parse(atob(window.location.hash.substr(1)));
			listingMode(config.limit,config.webhook)
		}catch(e){}


	});
}

