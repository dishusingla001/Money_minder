function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
  }
  
  // Close the dropdown if the user clicks outside of it
  window.onclick = function(e) {
    if (!e.target.matches('.dropbtn')) {
    var myDropdown = document.getElementById("myDropdown");
      if (myDropdown.classList.contains('show')) {
        myDropdown.classList.remove('show');
      }
    }
}
// Update the navbar based on login state
async function updateNavbar() {
  const token = localStorage.getItem('authToken'); // Retrieve token from localStorage
  if (!token) return; // If no token, show login option

  try {
      const response = await fetch('/loggedin-user', {
          headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
          const user = await response.json();
          const authLink = document.getElementById('auth-link');
          authLink.innerHTML = `<a href="#" onclick="logout()">Logout</a>`;

          const navbar = document.getElementById('navbar');
          const userWelcome = document.createElement('li');
          userWelcome.textContent = `Welcome, ${user.username}`;
          userWelcome.style.color = 'white';
          userWelcome.style.fontWeight = 'bold';

          navbar.querySelector('ul').prepend(userWelcome);
      }
  } catch (error) {
      console.log('Error updating navbar:', error);
  }
}

// Handle logout functionality
async function logout() {
  localStorage.removeItem('authToken'); // Remove the token from localStorage
  window.location.href = 'login.html'; // Redirect to login page
}

// Run updateNavbar on page load
document.addEventListener('DOMContentLoaded', updateNavbar);


  const toggle = document.getElementById("holo-toggle");

  toggle.addEventListener("change", function () {
    if (this.checked) {
      // Wait 2 seconds before redirecting
      setTimeout(() => {
        window.location.href = "gamersden.html";
      }, 2000); // 2000 milliseconds = 2 seconds
    }
  });


