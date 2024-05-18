const passwordInput = document.getElementById("password-input");
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

const passwordInput2 = document.getElementById("password-input2");
const toggleButton2 = document.getElementById("togglePassword2");

toggleButton2.addEventListener("click", function () {
  if (passwordInput2.type === "password") {
    passwordInput2.type = "text";
    toggleButton2.classList.add("fa-eye");
    toggleButton2.classList.remove("fa-eye-slash");
  } else {
    passwordInput2.type = "password";
    toggleButton2.classList.remove("fa-eye");
    toggleButton2.classList.add("fa-eye-slash");
  }
});

const passwordErrors = document.getElementsByClassName("pass_error");

passwordInput.addEventListener("input", function () {
  if (this.value.length < 4) {
    passwordErrors[0].style.display = "block";
  } else {
    passwordErrors[0].style.display = "none";
  }
});

passwordInput2.addEventListener("input", function () {
  if (this.value === passwordInput.value) {
    passwordErrors[1].style.display = "none";
  } else {
    passwordErrors[1].style.display = "block";
  }
});

document
  .getElementById("changedPasswordForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();

    if (passwordInput.value != passwordInput2.value) {
      return;
    }

    if (passwordInput.value.length < 4) {
      return;
    }

    document.getElementById("changedPasswordForm").submit();
  });
