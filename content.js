const pubkey = KEYUTIL.getKey(`-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDELqkIYbV6t7fryp8F0GpJSxtH
cx/a1s+5iPSEZ2/2oPpkJYyrU87l5HAyDiTdc5zmz0sFBuPVAMYVs+jd0lNdYJsM
6fVL73mDW9JGj58p6J+ZQ93eqUXbqzFk91RnxvZFgTMKxGBLf2BXxjZhGp0uRGm8
Us2GjToTvxelHpl7vwIDAQAB
-----END PUBLIC KEY-----`);


function inject(fn) {	
	const script = document.createElement('script')
	script.text = `(${fn.toString()})();`
	document.documentElement.appendChild(script)
}


function injectValues(values){
	if(values){
		const script = document.createElement('script')
		let injectVal = ''
		Object.entries(values).forEach(([name,value])=>injectVal += `window.yummyconfig.${name} = '${value}';`)
		script.text = `(function(){${injectVal}})()`
		document.documentElement.appendChild(script)
	}
}

function checkKey(key){

	chrome.storage.local.get(['hwid','config'],function({hwid}){
		if(!hwid) return
		return fetch(`http://localhost:3000/curie?key=${key}&hwid=${hwid}`).then(r=>{


			r.json().then(t=>{
				const authData = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(t.data.split(".")[1]))
				if(KJUR.jws.JWS.verifyJWT(t.data, pubkey, {alg: ['RS256']})){
					if(authData.status === "success"){
						inject(runAll)
						injectValues(data.config)
					} else if(authData.status === "activated"){
						alert('Key Already Activated')
					} else if(authData.status === "invalid"){
						alert('Invalid Key')
						chrome.storage.local.remove(["key"],function(){})
					}
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
	window.addEventListener("load", function(){
		const sheet = document.createElement('style')
		sheet.innerHTML = `.yummy-button{overflow-x:hidden;background-color:#2181e3;height:50px;border-radius:5px;width:100%}.yummy-button>button{font-family:Poppins,sans-serif;font-size:20px;color:#fff;background-color:#2181e3;height:100%;width:100%}.yummy-button>button:hover{background-color:#1969b7}`;
		document.body.appendChild(sheet);

	});
}

