const passwordInput = document.getElementById("emailpassword");
const toggleButton = document.getElementById("togglePassword");

toggleButton.addEventListener("click", function () {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleButton.classList.add("fa-eye");
    toggleButton.classList.remove("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    toggleButton.classList.remove("fa-eye");
    toggleButton.classList.add("fa-eye-slash");
  }
});
