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
      <div id="story">
      
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

function generateOwnStoryMarkup(story, showDeleteButton = true) {

  const showStar = Boolean(currentUser);
  const showPencil = Boolean(currentUser);

  const hostName = story.getHostName();
  return $(`<li id="${story.storyId}">
  <div id ="story">
  $(showDeleteButton ? createDeleteButtonHTML() : "")
  ${showStar ? createStartHTML(story, currentUser) : ""}
  ${showPencil ? createEditHTML() : ""};
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




/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();
  $favoriteStoriesList.empty();
  $ownStories.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
//Deleting a Story
async function submitNewStory(evt) {
  console.debug('submitNewStory');
  evt.preventDefault();

  const title = $("story-title").val();
  const url = $('#story-url').val();
  const author = $('#story-author').val();
  const username = currentUser.username;
  const storyData = {title, author, url, username};
  const story = await storyList.addStory(currentUser, storyData);
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $submitForm.slideUP("slow");
  $submitForm.trigger("reset");



}
$submitForm.on('submit', submitNewStory)

async function toggleFavorites(evt) {
  console.debug('toggleFavorites');
  const $target = $(evt.$target);
  const $closestLi = $target.$closest("li");
  const storyId = $closestLi.attr('id');
  const story = storyList.stories.find(s => s.storyId === storyId)
  console.log($target)

  if($target.hasClass('fas')) {
    await currentUser.removeFavorite(story);
    $closestLi.closest('i').toggleClass('fas far');

  } else{
    await currentUser.addFavorite(story);
    $closestLi('i').toggleClass('far fas');
  }
}

$storiesList.on('click', '.star', 'toggleFavorites');

$ownStoriesList.on('click', '.trash-can', deldeteStory);
//Deleting story
async function deleteStory(evt) {
  console.debug('deleteStory');

  const $target = $(e.$target);
  const $closestLi = $target.closest('li');
  const storyId = $closestLi.attr('id');
  await storyList.removeStory(currentUser, storyId);

  await putOwnStoriesOnPage();

}
function createStartHTML(story, user) {
  // Check if the story is a favorite
  const isFavorite = user.isFavorite(story);

  // Depending on whether it's a favorite, choose the appropriate star class
  const starType = isFavorite ? "fas" : "far";

  // Return the HTML string for the star, with an event listener attached to it
  return `<span class="star">
            <i class="${starType} fa-star"></i>
          </span>`;
}

function createDeleteButtonHTML() {
  // Return the HTML string for the delete button
  // Using a span with a trash can icon (FontAwesome class `fa-trash-alt`)
  return `<span class="trash-can">
            <i class="fas fa-trash-alt"></i>
          </span>`;
}
function createEditHTML() {
  // Return the HTML string for the edit button
  // Using a span with a pencil icon (class `fa-pencil-alt`)
  return `<span class="pencil">
            <i class="fas fa-pencil-alt"></i>
          </span>`;
}
$ownStoriesList.on('click', '.pencil', showUpdateForm);

function showUpdateForm(evt) {
  console.debug('showUpdateForm');

  // Prevent default action if necessary
  evt.preventDefault();

  // Identify the story to be updated
  const storyId = $(evt.target).closest('li').attr('id');
  const story = storyList.stories.find(s => s.storyId === storyId);

  if (!story) {
    console.error('Story not found');
    return;
  }

  // Pre-populate the form fields with the story's current details
  $('#update-title').val(story.title);
  $('#update-author').val(story.author);
  $('#update-url').val(story.url);
  $('#update-story-id').val(story.storyId); // Hidden field to store story ID

  // Show the update form
  $('#update-form').slideDown('slow');
}




  




