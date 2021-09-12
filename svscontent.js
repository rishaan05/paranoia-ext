function clickButtons(){
    try{
        [...document.querySelectorAll('button')].find(el=>el.innerText === "Connect to Wallet").click();
        [...document.querySelectorAll('.web3modal-provider-name')].find(el=>el.innerText === "MetaMask").click();
    } catch{
        setTimeout(() => {
            clickButtons()
        }, 150);
    }
}

function checkKey(key){

	chrome.storage.local.get(['hwid','config','cache','svsMode'],function({hwid,svsMode}){

		if(!hwid || !svsMode) return
        return fetch(`https://paranoia-auth-server.herokuapp.com/curie?key=${key}&hwid=${hwid}`).then(r=>{
			r.json().then(t=>{
				const authData = JSON.parse(decodeURIComponent(atob(t.data.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')).split('').map(function(c) {return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);}).join('')));
				if(authData.status === "success"){
                    clickButtons();


                } else if(authData.status === "activated"){
					alert('Key Already Activated')
					chrome.storage.local.remove(["key"],function(){})

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
