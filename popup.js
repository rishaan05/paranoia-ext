chrome.storage.local.get(['hwid','key'],function(data){
    if(!data.hwid){
        chrome.storage.local.set({hwid: uuidv1()}, function() {

        });
    } else{
        console.log(data.key)
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


        if(fetch.toString() === "function fetch() { [native code] }"){
            return fetch(`https://paranoia-auth-server.herokuapp.com/curie?key=${key}&hwid=${hwid}`,{
                headers: {
                    'x-request-id':uuidv4()
                },
            }).then(r=>{
                r.json().then(t=>{
                    if(t.status === "success"){
                        chrome.storage.local.set({key}, function() {});
                        showSuccess(t.username,t.avatar)
                    } else if(t.status === "activated"){
                        alert('Key Already Activated')
                    } else if(t.status === "invalid"){
                        alert('Invalid Key')
                        chrome.storage.local.remove(["key"],function(){})
                    }
                })
            }).catch(e=>{
                alert('Invalid Key')
            })
        } else{
            fetch(`https://paranoia-auth-server.herokuapp.com/curie?key=${key}&hwid=${hwid}`,{
                headers: {
                    'x-request-id':uuidv1()
                },
            })
        }
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