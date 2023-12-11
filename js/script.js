

const usernameInput = document.querySelector('.username-input');
const suggestionsContainer = document.querySelector('.suggestions');
const app = document.getElementById('app');
const mainDiv = document.querySelector('.user-info');

// Добавляем событие input для поля ввода
usernameInput.addEventListener('input', debounce(handleInput, 300));


async function handleInput() {
  const searchTerm = usernameInput.value.trim();

  if (searchTerm === '') {
    clearSuggestions();
    return;
  }

  try {
    const apiUrl = `https://api.github.com/search/users?q=${searchTerm}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Отображаем динамические предложения поиска
    displaySuggestions(data.items);
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    clearSuggestions();
  }
}

function displaySuggestions(suggestions) {
  mainDiv.style.display = 'none'
  suggestionsContainer.style.display = 'flex'
  clearSuggestions();

  suggestions.forEach((user) => {
    const suggestionItem = document.createElement('div');
    const img = document.createElement('img');
    img.classList.add('img-suggestion');
    img.src= user.avatar_url;
    suggestionItem.textContent = user.login;
    suggestionItem.classList.add('suggestion-item');

    // Добавляем обработчик клика для выбора предложения
    suggestionItem.addEventListener('click', () => {
      usernameInput.value = user.login;
      clearSuggestions();
    });
    suggestionItem.appendChild(img);
    suggestionsContainer.appendChild(suggestionItem);
  });
}

function clearSuggestions() {
  suggestionsContainer.innerHTML = '';
}

function debounce(func, delay) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

async function searchUser() {
  clearSuggestions();
  const username = usernameInput.value
  const apiUrl = `https://api.github.com/users/${username}`;
  
  try {
    const response = await fetch(apiUrl);
    const userData = await response.json();

    // Display user information
    displayUserInfo(userData);
  } catch (error) {
    // Handle errors (e.g., user not found)
    displayErrorMessage('User not found');
  }
}

async function fetchRandomUser() {
  const apiUrl = 'https://api.github.com/users';
  
  try {
    const response = await fetch(apiUrl);
    const users = await response.json();

    // Choose a random user from the array
    const randomUser = users[Math.floor(Math.random() * users.length)];
  
    const data = await fetch(randomUser.url);
    displayUserInfo( await data.json())
  } catch (error) {
    // Handle errors
    displayErrorMessage('Failed to fetch random user');
  }
}

function displayUserInfo(user) {
  if(user.login === undefined){
     displayErrorMessage(`Don't find user`)
      return;
  }
  suggestionsContainer.style.display = 'none'
  mainDiv.style.display = 'block'
  mainDiv.innerHTML = '';
  mainDiv.classList.add('user-info')
  mainDiv.innerHTML = `
           <img src="${user.avatar_url}" alt="User Avatar">
          <p>Username: ${user.login}</p>
          <p>Bio: ${user.bio || 'N/A'}</p>
          <p>Location: ${user.location || 'N/A'}</p>
          <p>Followers: ${user.followers}</p>
          <div> Repositories: </div>    
  `
  getInfoForUser(user.repos_url)
}

async function getInfoForUser(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    displayRepo(data);
  } catch (error) {
    // Handle errors
    displayErrorMessage('Failed to fetch random user');
  }
}

function displayRepo(repos){
  console.log(repos);
  const ulEl = document.createElement('ul');
  ulEl.innerHTML =  repos.map((e) => {
    return `<li> <a href="${e.html_url}">${e.full_name}</a> <p>Description: ${e.description == null ? 'Dont have' : e.description}</p></li>`;
  }).join('')
  mainDiv.appendChild(ulEl);
}


function displayErrorMessage(message) {
  suggestionsContainer.style.display = 'none'
  mainDiv.style.display = 'block'
  mainDiv.innerHTML = '';
  mainDiv.textContent = message;
}