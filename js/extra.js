//ON NAV

"use strict";


/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

//Submit form on clicnking

function navSubmitStoryClick(evt) {
  console.debug("navSubmitStoryClick", evt);
  hidePageComponents();
  $submitForm.show();
  $allStoriesList.show();
}

$navSubmitStory.on("click", navSubmitStoryClick);


//My Stories on Click

function navMyStories (evt) {
  console.debug("navMyStories", evt);
  hidePageComponents();
  putUserStoriesOnPage();
  $ownStories.show();
}
$body.on("click", "#nav-my-stories", navMyStories);



/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
  $storiesContainer.hide()
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

//Favorite Stries

function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt);
  hidePageComponents();
  putFavoritesListOnPage();
  
}

$body.on("click", "#nav-favorites", navFavoritesClick);

//MAIN.JS

"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");
const $storiesList = $(".stories-list");
const ownStories = $("#my-stories");
const $favoriteStories = $("#favorite-stories");



const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");
const submitForm = $("#submit-form");


const storiesContainer = $("#stories-container");

const $navLogin = $("#nav-login");
const navSubmitStory = $("#nav-submit-story");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");
const $userProfile = $("#user-profile");

/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() {
  const components = [
    $allStoriesList,
    $loginForm,
    $signupForm,
    $submitForm,
    $userProfile
  ];
  components.forEach(c => c.hide());
}

/** Overall function to kick off the app. */

async function start() {
  console.debug("start");

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  // if we got a logged-in user
  if (currentUser) updateUIOnUserLogin();
}

// Once the DOM is entirely loaded, begin the app

console.warn("HEY STUDENT: This program sends many debug messages to" +
  " the console. If you don't see the message 'start' below this, you're not" +
  " seeing those helpful debug messages. In your browser console, click on" +
  " menu 'Default Levels' and add Verbose");
$(start);



//STORIES

"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  
  const hostName = story.getHostName();
  const showStar = Boolean(currentUser);
  

  return $(`
      <li id="${story.storyId}">
      <div>
      
      ${showStar ? createStartHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        </div>
      </li>
    `);
}
//Delete btn for HTML for story

function getDeleteBtnHTML() {
  return `<button class= "delete-story-btn">Delete Story</button>`;
}

/** Make favorite/not-favorite star for story */
/** 
@param {Object} story 
@param {Object} currentUser
@returns {string} //string for the fav/unfavorite star
*/


function getStartHTML(story, currentUser) {
  const isFavorite = currentUser.isFavorite(story);
  const starClass = isFavorite ? "fas fa-star" : "far fa-star";
  return`<span class="star">
            <i class="${starClass}"></i>
         </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
//Deleting a Story


/**
 * @param {string} story Id
 */
function deleteStory(storyId) {
  if (!confirm("Want to delete this story?")) {
    return;
  }

  fetch(`/api/stories/${storyId}`, {method: 'DELETE' })
  .then(response => {
    if (!response.ok) {
      throw new Error("Error deleting story");
    }
    return response.json();
  })
  .then(() => {
    removeStoryFromUI(storyId);
  })
  .catch(error => {
    console.error("Error to delete story:", error);
  })
}
/**
 * @param {string} storyId
 */
function removeStoryFromUI(storyId) {
  const storyElement = document.getElementById(storyId);
  if(storyElement){
    storyElement.remove();
  }
}
//Submit new stories

async function submitNewStory(evt) {
  evt.preventDefault(); // prevent the default form submission behavior

  // Assuming you have form fields with IDs 'story-title', 'story-author', 'story-url'
  const title = $("#story-title").val();
  const author = $("#story-author").val();
  const url = $("#story-url").val();

  const newStory = { title, author, url };

  try {
 
    const story = await storyList.addStory(currentUser, newStory);
    $allStoriesList.prepend(generateStoryMarkup(story));
  } catch (error) {
    console.error("Error submitting new story", error);
  
  }
}
$("#submit-story-form").on("submit" , submitNewStory);