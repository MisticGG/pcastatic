document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('loginButton');
  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');
  const statusMessage = document.getElementById('statusMessage');

  // Check if the user is already logged in
  const storedUsername = sessionStorage.getItem('username');
  if (storedUsername) {
      // If already logged in, show a message and redirect after 2 seconds
      statusMessage.textContent = `You are already logged in as ${storedUsername}. Redirecting...`;
      setTimeout(() => {
          window.location.href = '../'; // Redirect to home page
      }, 300);
  }

  loginButton.addEventListener('click', () => {
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
      
      if (username && password) {
          // Store username and password in localStorage
          sessionStorage.setItem('username', username);
          sessionStorage.setItem('password', password); // Store password too

          // Show success message
          statusMessage.textContent = `Welcome, ${username}! Logging you in...`;
          setTimeout(() => {
              window.location.href = '../'; // Redirect to home page after 2 seconds
          }, 300);
      } else {
          // Show error if no username or password entered
          statusMessage.textContent = 'Please enter both username and password.';
      }
  });
});
