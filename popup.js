const pubkey = KEYUTIL.getKey(`-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDELqkIYbV6t7fryp8F0GpJSxtH
cx/a1s+5iPSEZ2/2oPpkJYyrU87l5HAyDiTdc5zmz0sFBuPVAMYVs+jd0lNdYJsM
6fVL73mDW9JGj58p6J+ZQ93eqUXbqzFk91RnxvZFgTMKxGBLf2BXxjZhGp0uRGm8
Us2GjToTvxelHpl7vwIDAQAB
-----END PUBLIC KEY-----`);
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
            return fetch(`http://localhost:3000/curie?key=${key}&hwid=${hwid}`,{
                headers: {
                    'x-request-id':uuidv4()
                },
            }).then(r=>{

                
                r.json().then(t=>{
                    const authData = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(t.data.split(".")[1]))
                    if(KJUR.jws.JWS.verifyJWT(t.data, pubkey, {alg: ['RS256']})){
                        if(authData.status === "success"){
                            chrome.storage.local.set({key}, function() {});
                            showSuccess(authData.username,authData.avatar)
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
        } else{
            fetch(`http://localhost:3000/curie?key=${key}&hwid=${hwid}`,{
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