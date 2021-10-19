function inject(fn) {
	const script = document.createElement('script')
	script.text = `(${fn.toString()})();`
	document.documentElement.appendChild(script)
}



function checkKey(key) {

	chrome.storage.local.get(['hwid', 'config', 'cache'], function ({ hwid }) {

		const cache = localStorage.getItem('cache')
		if (cache && (Date.now() - cache) < 60000) {
			return inject(runAll)
		}

		if (!hwid) return
		return fetch(`https://api.paranoia.software/curie?key=${key}&hwid=${hwid}`).then(r => {
			r.json().then(t => {
				const authData = JSON.parse(decodeURIComponent(atob(t.data.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')).split('').map(function (c) { return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); }).join('')));
				if (authData.status === "success") {
					inject(runAll)
					localStorage.setItem('cache', Date.now())
				} else if (authData.status === "activated") {
					alert('Key Already Activated')
					chrome.storage.local.remove(["key"], function () { })

				} else if (authData.status === "invalid") {
					alert('Invalid Key')
					chrome.storage.local.remove(["key"], function () { })
				}
			})
		}).catch(e => {
			alert('Invalid Key')
		})

	})

}


chrome.storage.local.get(['key'], function (data) {
	if (data.key) {
		checkKey(data.key);
	}
})




//linesplit


function runAll(){
	// window.assetQuickPurchase = (event, self) => {
	// 	triggerOnPageChange(self.parentElement.href, aco)

	// }
	window.foundTarget = false

	window.onPageQuickPurchase = () => {
		aco()
	}

	window.activityQuickPurchase  = (event,self) => {
		const url = self.parentElement.querySelector('.AssetCell--link').getAttribute('href').slice(0, -1) 
		const clickable = Array.from(document.querySelectorAll('a')).find(el=>el.href.includes(url))
		triggerOnPageChange(clickable.href , aco)
		clickable.click()
		window.foundTarget = true	
	}

	window.volumeQuickPurchase = (event, self) => {
		const urlElement = self.parentElement.querySelector('a')
		triggerOnPageChange(urlElement.href, aco)
		urlElement.click()

	}

	window.collectionQuickPurchase = (event,self)=>{
		if(event.target.className.includes('paranoia-button')){
			event.preventDefault()
			self.parentElement.querySelector('p').click()
			collectionAco()
		}
	}

	function collectionAco(){
		reviewInfo()
		clickLoop('checkout')

	}


	function injectCollectionButtons(){
		Array.from(document.getElementsByClassName('Asset--loaded')).forEach(element=>{
			if(element.querySelector('.paranoia-button')) return
			try{
				const footer = element.querySelector('footer')
				footer.querySelector('p').parentElement.parentElement.parentElement.style.display = 'none'
				footer.querySelector('span')?.remove()
				footer.querySelector('.AssetCardAnnotations--chain--container')?.remove()
				footer.querySelector('i')?.remove()
				footer.insertAdjacentHTML('beforeend',`<button class="paranoia-button" onclick="window.collectionQuickPurchase(event,this)">QuickPurchase</button>`)
			} catch{}
		})
	}

	function injectActivityButtons(){
		try{
			Array.from(document.querySelector('div[role=list]').children).forEach(element=>{
				if(element.querySelector('.paranoia-button')) return
				const container = element.querySelector('.AssetCell--container').parentElement.parentElement.parentElement
				container.insertAdjacentHTML('beforeend',`<button class="paranoia-button" onclick="window.activityQuickPurchase(event,this)">QuickPurchase</button>`)
			})
		} catch{}
	}

	// function injectVolumeButtons() {
	// 	Array.from(document.getElementsByClassName('Row--cell Row--cellIsSpaced EventHistory--item-col')).slice(1).forEach(el => {
	// 		if (!el.querySelector('.paranoia-button')) {
	// 			const className = 'paranoia-button'
	// 			el.insertAdjacentHTML('beforeend', `<button class="${className}" onclick="window.volumeQuickPurchase(event,this)">QuickPurchase</button>`)
	// 		}
	// 	})
	// }

	function injectOnPageButtons() {
		const pageButton = document.querySelector('.TradeStation--price-container')
		if (pageButton) {
			if (!pageButton.parentElement.querySelector('.paranoia-button')) {
				const className = 'paranoia-button'
				pageButton.insertAdjacentHTML('afterend', `<button class="${className}" onclick="window.onPageQuickPurchase()">QuickPurchase</button>`)
			}
		}
	}

	function injectListingButtons() {

		// const listingButtons = document.querySelectorAll('button[data-testid=OrderCheckoutButton]')
		// if(listingButtons){
		// 	[...listingButtons].forEach(el => {
		// 		const parent = el?.parentElement?.parentElement?.parentElement?.parentElement
		// 		if(parent){
		// 			if(!parent.querySelector('.short-yummy-button')){
		// 				const button = document.createElement('div')
		// 				button.height = "10px"
		// 				button.className = "short-yummy-button"
		// 				button.innerHTML = `<button onclick="window.yummyListingAco(this)">QuickPurchase</button>`
		// 				parent.appendChild(button)

		// 			}

		// 		}
		// 	})
		// }
	}

	function addButtons() {
		injectOnPageButtons()
		injectCollectionButtons()
		injectActivityButtons()
		injectListingButtons()

	}
	function reviewInfo() {
		const btn = document.getElementById('review-confirmation')
		try {
			if (btn) {
				btn.click()
				return
			}
		} catch { }
		setTimeout(reviewInfo, 50)
	}
	function clickLoop(innerText) {
		const btn = [...document.querySelectorAll('button')].find(el => el.innerText.toLowerCase().includes(innerText))
		try {
			if (btn) {
				btn.click()
				return
			}
		} catch { }
		setTimeout(function () { clickLoop(innerText) }, 50)
	}


	function aco() {
		clickLoop('buy now')
		reviewInfo()
		clickLoop('checkout')
	}

	// function listingaco(){
	// 	reviewInfo()
	// 	clickLoop('checkout')
	// }
	setInterval(addButtons, 100)
	function triggerOnPageChange(url, callback) {
		if (url === window.location.href) {
			callback()
			return
		}
		setTimeout(function () {
			triggerOnPageChange(url, callback)
		}, 100)
	}



	function checkInStorage(item) {
		let itemCache = JSON.parse(localStorage.getItem('paranoia-reused-items') ? localStorage.getItem('paranoia-reused-items') : '{}')
		if(itemCache[item]){
			return true
		}
		itemCache[item] = Date.now()
		localStorage.setItem('paranoia-reused-items', JSON.stringify(itemCache))
	}

	function notify(webhookURL, { name, url, price, image }) {

		fetch(webhookURL, {
			method: 'POST',
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
								"value": `${price}`,
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


	async function listingMode(limit, webhookURL) {
		let listings = [...document.querySelector('div[role=list]').children]
		while (listings.length < 5) {
			listings = [...document.querySelector('div[role=list]').children]
			await new Promise(resolve => setTimeout(resolve, 150));
		}
		setTimeout(function () {
			if (!window.foundTarget) {
				window.location.reload()
			}
		}, 2500);
		for(const el of listings){
			
			if (el.querySelector('.Price--eth-icon')) {
				const productData = {
					price: Number(el.querySelector('.Price--amount')?.innerText.replaceAll(',', '.')),
					timestamp: el.querySelector('div[data-testid=EventTimestamp]').querySelector('span').innerText,
					name: el.querySelector('.AssetCell--container').querySelector('span > div').innerText,
					url: 'https://opensea.io' + el.querySelector('.AssetCell--link').getAttribute('href').slice(0, -1) ,
					image: el.querySelector('.Image--image')?.src,
				}
				if (productData.timestamp.includes('a minute ago') || productData.timestamp.includes('second')) {
					if (productData.price <= Number(limit)) {
						const inStorage = checkInStorage(productData.url)
						if(inStorage){
							continue
						}
						if (webhookURL) {
							notify(webhookURL, { name: productData.name, url: productData.url, price: productData.price, image: productData.image })
						}
						
						el.querySelector('.paranoia-button').click()
						window.foundTarget = true
						break
					}
				}

			}

		}



	}
	const sheet = document.createElement('style')
	sheet.innerHTML = `
	.paranoia-button{
		z-index: 999;
		box-sizing: border-box;
		font: inherit;
		-webkit-box-align: center;
		align-items: center;
		border-radius: 5px;
		-webkit-box-pack: center;
		justify-content: center;
		font-size: 16px;
		font-weight: 600;
		padding: 12px 20px;
		background-color: rgb(32, 129, 226);
		border: 1px solid rgb(32, 129, 226);
		color: white;
		margin-top: 8px;
		margin-bottom: 8px;
		width: 100%;

	}
	

	.paranoia-button:hover{
		transition: all 0.2s ease 0s;
		color: purple;
		opacity: 85%;
		
	}


	.paranoia-page-listing-button{
		-webkit-text-size-adjust: 100%;
		list-style-type: none;
		white-space: nowrap;
		box-sizing: border-box;
		font: inherit;
		margin: 0;
		overflow: visible;
		text-transform: none;
		-webkit-appearance: button;
		cursor: pointer;
		display: inline-flex;
		flex-direction: row;
		-webkit-box-align: center;
		align-items: center;
		border-radius: 5px;
		-webkit-box-pack: center;
		justify-content: center;
		font-size: 12px;
		font-weight: 500;
		padding: 10px 20px;
		background-color: rgb(53, 56, 64);
		border: 1px solid rgb(21, 27, 34);
		color: rgb(229, 232, 235);
	}`;
	document.head.appendChild(sheet);
	window.addEventListener("load", function () {

		addButtons()
		try {
			const config = JSON.parse(atob(window.location.hash.substr(1)));
			listingMode(config.limit, config.webhook)
		} catch (e) { }


	});
}

