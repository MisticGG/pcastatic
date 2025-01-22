document.addEventListener("DOMContentLoaded", () => {
  const chatButton = document.getElementById('chatButton')
  const iconButton = document.querySelector('.icon-button');
  const username = sessionStorage.getItem('username');
  
  const span = document.createElement('span');
  if (username) {
    span.textContent = `Logged in as ${username}`;
    iconButton.appendChild(span);
  } else {
    span.textContent = `Logged out. Click to log in`;
    iconButton.appendChild(span);
  }
  chatButton.addEventListener('click', () => {
    const username = sessionStorage.getItem('username');
    const password = sessionStorage.getItem("password")
    if (username && password) {
      setTimeout(() => {
        window.location.href = './chat';
      }, 300);
    } else {
      window.location.href = './login';
    }
  });
  iconButton.addEventListener('mouseenter', () => {
    const username = sessionStorage.getItem('username');
    const password = sessionStorage.getItem('password');
    if (username && password) {
      span.textContent = `Logged in as ${username}`;
    } else {
      span.textContent = `Logged out. Click to log in`;
    }

    const textWidth = span.offsetWidth; 
    const additionalPadding = 10; 
    const baseWidth = 42; 
    iconButton.style.width = `${baseWidth + textWidth + additionalPadding}px`;

    span.style.opacity = '1'; 
  });

  iconButton.addEventListener('mouseleave', () => {
    iconButton.style.width = '42px';
    span.style.opacity = '0';
  });

  iconButton.addEventListener('click', () => {
    const username = sessionStorage.getItem('username');
    const password = sessionStorage.getItem("password")
    if (username && password) {
      alert(`You are already logged in as ${username}.`);
    } else {
      window.location.href = './login';
    }
  });
});

function updateIconBasedOnLocalStorage() {
  const username = sessionStorage.getItem('username');
  const password = sessionStorage.getItem('password');
  const iconElement = document.getElementById('icon');

  if (username && password) {
    iconElement.src = "user-logged-in.png"; 
    iconElement.alt = "Logged In Icon";
  } else {
    iconElement.src = "user-logged-out.png"; 
    iconElement.alt = "Logged Out Icon";
  }
}

updateIconBasedOnLocalStorage();
