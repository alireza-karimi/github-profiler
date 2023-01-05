
// selecting objects from html
const userIdInput = document.querySelector('#userId_input');
const submitButton = document.querySelector('#submit_button');
const bioData = document.querySelector('#bio_data')
const fullNameData = document.querySelector('#full_name_data')
const blogData = document.querySelector('#blog_data')
const locationData = document.querySelector('#address_data')
const avatarData = document.querySelector('#avatar_data')
const errorData = document.querySelector('#error_data')
const favoriteData = document.querySelector('#favorite_language_data')

// getting Github profile using API
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
                let favoriteLanguage = await detectFavoriteLanguage(userId)
                setProfileData(data, favoriteLanguage);
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
                let favoriteLanguage = await detectFavoriteLanguage(userId)
                saveProfileInLocalStorage(userId, obj)
                setProfileData(obj, favoriteLanguage);
            }

        } catch (e) {
            showError("Connection error!"); // showing error when we cannot perform the API request
        }
    } else {
        showError("Input is not valid!");
    }
}

// detecting favorite language of a user
async function detectFavoriteLanguage(userId) {

    try{
        let response = await fetch(`https://api.github.com/users/${userId}/repos`);
                let objs = await response.json();
                if (response.status != 200) {
                    if(response.status == 404){
                        showError("Profile not available!"); // showing error when profile is not avialble
                    }
                    else{
                        showError(`Request failed with error ${response.status}`); // showing errors other than 404
                    } 
                    return        
                }

                // counting occurance of language in repos
                var countObj = objs.reduce((a, obj)=>{
                    a[obj.language] =  (a[obj.language] || 0 ) + 1;
                    return a
                 },{});

                // getting the most frequent language
                var favorite = Object.keys(countObj)
                  .sort((a,b) => countObj[b] - countObj[a] )
                  .slice(0,1)

                console.log(favorite[0])
                return favorite[0]
                
    } catch (e) {
        showError("Error getting repos!"); // showing error when we cannot perform the API request
    }
}

// clearing current shown data in profile section
function clearProfileData() {
    bioData.innerHTML = "<span>Bio</spane>";
    fullNameData.innerHTML = "<span>Name</spane>";
    blogData.innerHTML = "<span>Blog</spane>";
    locationData.innerHTML = "<span>Location</spane>";
    avatarData.setAttribute("src", "././images/icon.png");
    favoriteData.innerHTML = "<span>Favorite Language</spane>";
    errorData.style.display = "none";
}

// setting profile data in profile section
function setProfileData(obj, favoriteLanguage) {
    console.log(favoriteLanguage)
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

    // setting favorite language
    if (favoriteLanguage != null && favoriteLanguage != '' && favoriteLanguage != 'null'){
        favoriteData.innerHTML = "<span>Favorite Language: " + favoriteLanguage + "</span>";
    } else {
        favoriteData.innerHTML = "<span>No Favorite Language</spane>";
    }

}

// saving profile in local storage
async function saveProfileInLocalStorage(userId, obj) {
    try {
        window.localStorage.setItem(userId, JSON.stringify(obj));
    } catch (e) {
        showError("Could not save in local storage!");
    }
    
}

// checking format of input userId. if the length is zero, it returns false
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
