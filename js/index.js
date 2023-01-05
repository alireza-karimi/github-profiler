
// selecting objects from html
const userIdInput = document.querySelector('#userId_input');
const submitButton = document.querySelector('#submit_button');
const bioData = document.querySelector('#bio_data')
const fullNameData = document.querySelector('#full_name_data')
const blogData = document.querySelector('#blog_data')
const locationData = document.querySelector('#address_data')
const avatarData = document.querySelector('#avatar_data')
const errorData = document.querySelector('#error_data')


async function getGithubProfile(e) {
    // cancel submit event
    e.preventDefault(); 
    // first clearing all previous data
    clearProfileData()

    let userId = userIdInput.value;

    if (checkFormat(userId)) {
        try {
            
            // checking local storage to see if profile is available
            let data = JSON.parse(window.localStorage.getItem(userId));
            if (data != null) { // profile available in local storage
                setProfileData(data);
            } else { // profile not available in local storage
                let response = await fetch(`https://api.github.com/users/${userId}`);
                let obj = await response.json();
                if (response.status != 200) {
                    if(response.status == 404){
                        showError("Profile not available!"); // showing error when profile is not avialble
                    }
                    else{
                        showError(`Request failed with error ${response.status}`); // showing errors other than 404
                    } 
                    return                 
                }
                saveProfileInLocalStorage(userId, obj)
                setProfileData(obj);
            }

        } catch (e) {
            showError("Connection error!"); // showing error when we cannot perform the API request
        }
    } else {
        showError("Input is not valid!");
    }
}


function clearProfileData() {
    bioData.innerHTML = "<span>Bio</spane>";
    fullNameData.innerHTML = "<span>Name</spane>";
    blogData.innerHTML = "<span>Blog</spane>";
    locationData.innerHTML = "<span>Location</spane>";
    avatarData.setAttribute("src", "././images/icon.png");
    errorData.style.display = "none";
}

function setProfileData(obj) {

    // setting bio
    if (obj.bio != null) {
        bioData.innerHTML = "<span>" + obj.bio + "</span>";
    } else {
        bioData.innerHTML = "<span>No Bio</spane>";
    }

    // setting full name
    if (obj.name != null) {
        fullNameData.innerHTML = "<span>" + obj.name + "</span>";
    } else {
        fullNameData.innerHTML = "<span>No Name</spane>";
    }

    // setting blog data
    if (obj.blog != null) {
        blogData.innerHTML = "<span>" + obj.blog + "</span>";
        if(obj.blog.startsWith("http")){
            blogData.setAttribute("href", obj.blog)
        }
        else{
            blogData.setAttribute("href", "https://" + obj.blog)
        }
        
    } else {
        blogData.innerHTML = "<span>No Blog</spane>";
    }

    // setting address data
    if (obj.location != null) {
        locationData.innerHTML = "<span>" + obj.location + "</span>";
    } else {
        locationData.innerHTML = "<span>No Address</spane>";
    }

    // setting avatar
    if (obj.avatar_url != null) {
        avatarData.setAttribute("src", obj.avatar_url);
    } else {
        avatarData.setAttribute("src", "././images/icon.png");
    }

}

async function saveProfileInLocalStorage(userId, obj) {
    try {
        window.localStorage.setItem(userId, JSON.stringify(obj));
    } catch (e) {
        showError("Could not save in local storage!");
    }
    
}

function checkFormat(userId) {
    if(userId.length < 1){
        return false
    }
    return true;
}

// showing error in page and removing after 5s
function showError(errorMessage) {
    errorData.style.display = "block";
    errorData.innerHTML = "<span>" + errorMessage + "</span>"
    setTimeout(() => {  // removing error after 5s
        errorData.style.display = "none";
    }, 5000);
}

// adding listeners to objects
submitButton.addEventListener('click', getGithubProfile);
