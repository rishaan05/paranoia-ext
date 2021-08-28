for(let i = 1;i<5;i++){
    KUTE.fromTo(
        `#line${i}a`,{path:`#line${i}a`},{path:`#line${i}b`},{repeat:999,duration:3000,yoyo:true}
    ).start()
}


function showSuccess(){
    document.querySelector('.login-page').style.display = 'none'
    document.querySelector('.success-page').style.display = 'flex'
}


document.getElementById('login').onclick = function(){
    showSuccess()
}