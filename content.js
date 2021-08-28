function inject(fn) {	
	if(1){
		const script = document.createElement('script')
		script.text = `(${fn.toString()})();`
		document.documentElement.appendChild(script)
	}
}

function runAll(){
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
		sheet.innerHTML = `.yummy-button{height:30px;width:100%}.yummy-button>button{height:100%;width:100%}.yummy-button>button:hover{background-color:red}`;
		document.body.appendChild(sheet);
		window.yummyacoAssets = (self)=>{
		console.log('aaa')
		triggerOnPageChange(self.parentElement.parentElement.parentElement.parentElement.href,aco)
	}
	});
}

inject(runAll)