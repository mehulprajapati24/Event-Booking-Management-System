var menuItem = document.getElementById("menuItem");

function toggleMenu(){
    if(menuItem.style.height == "0px")
    {
        menuItem.style.height = "460px"
    }
    else{
        menuItem.style.height = "0px"
    }
}

function btnColor(index){
    let btns = document.getElementsByClassName('scheduleBtn');
    let scheduleDate = document.getElementsByClassName('scheduleDate');
    for (let i=0;i<btns.length;i++){
        if(index==i){
            btns[i].style.backgroundColor="#F82249";
            btns[i].style.borderColor="#F82249";
            scheduleDate[i].style.display="block";
        }
        else{
            btns[i].style.backgroundColor="#0E1B4D";
            btns[i].style.borderColor="#0E1B4D";
            scheduleDate[i].style.display="none";
        }
    }
}

function closeMenu(){
    if (window.innerWidth <= 1114) {
        menuItem.style.height = "0px";
    }
}

var gallery = ["/img/gallery/1.jpg", "/img/gallery/2.jpg", "/img/gallery/3.jpg", "/img/gallery/4.jpg", "/img/gallery/5.jpg", "/img/gallery/6.jpg", "/img/gallery/7.jpg", "/img/gallery/8.jpg"];
    var position = 0;
    function changeImage(pos){
    var imageSrc = document.getElementById("imageGallery");
    if(pos == "left"){
        position--;
    }
    if(pos == "right"){
        position++;
    }
    if (position == -1){
        position = 7;
    }
    else{
        position = position % gallery.length;
    }
    imageSrc.src = gallery[position];
    };


    function toggleDropDown(){
        if(document.getElementById("dropdownList").style.display == "none"){
            document.getElementById("dropdownList").style.display = "block";
        }
        else{
            document.getElementById("dropdownList").style.display = "none";
        }
    }

    function toggleDropDown2(){
        if(document.getElementById("dropdownList2").style.display == "none"){
            document.getElementById("dropdownList2").style.display = "block";
        }
        else{
            document.getElementById("dropdownList2").style.display = "none";
        }
    }


