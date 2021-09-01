
chrome.storage.local.get(['hwid','key'],function(data){
    if(!data.hwid){
        chrome.storage.local.set({hwid: uuidv1()}, function() {

        });
    } else{
        if(data.key){
            checkKey(data.key)
        }

    }
})



for(let i = 1;i<5;i++){
    KUTE.fromTo(
        `#line${i}a`,{path:`#line${i}a`},{path:`#line${i}b`},{repeat:999,duration:3000,yoyo:true}
    ).start()
}





function checkKey(key){
    chrome.storage.local.get(['hwid'],function({hwid}){

        return fetch(`https://paranoia-auth-server.herokuapp.com/curie?key=${key}&hwid=${hwid}`,{
            headers: {
                'x-request-id':uuidv4()
            },
        }).then(r=>{

            
            r.json().then(t=>{
                const authData = JSON.parse(decodeURIComponent(atob(t.data.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join('')));
                if(authData.status === "success"){
                    chrome.storage.local.set({key}, function() {});
                    showSuccess(authData.username,authData.avatar)
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


async function showSuccess(username,pfp){


    document.querySelector('.login-page').style.display = 'none'
    document.querySelector('.success-page').style.display = 'flex'  
    document.querySelector('.profile-picture').src = pfp
    document.querySelector('.username').textContent = username


}


async function showLogin(){

    document.querySelector('.login-page').style.display = 'flex'
    document.querySelector('.success-page').style.display = 'none'  
    chrome.storage.local.remove(["key"],function(){})


}




document.getElementById('login').onclick = function(){

    checkKey(document.getElementById('keyinput').value)
}

document.getElementById('logout').onclick = function(){
    showLogin()
}


document.getElementById('test').onclick = function(){

    
    fetch(document.getElementById('webhook').value,{
        method:'POST',
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            "content": null,
            "embeds": [
              {
                "title": "Test Webhook",
                "color": null,
                "author": {
                  "name": "Paranoia Extension",
                  "url": "https://twitter.com/paranoia_v1"
                }
              }
            ]
          })
    })
}


document.getElementById('start').onclick = function(){
    const collection = document.getElementById('collection')?.value.trim()
    const limit = document.getElementById('limit')?.value.trim()
    const webhook = document.getElementById('webhook')?.value.trim()
    if(collection && limit){
        if(Number(limit)){
            window.open( `https://opensea.io/activity/${collection.toLowerCase()}?search[isSingleCollection]=true&search[eventTypes][0]=AUCTION_CREATED#${btoa(JSON.stringify({limit,webhook}))}`)
        } else{
            alert('Invalid Limit')
        }

    } else{
        alert('Please fill in all fields')
    }

}