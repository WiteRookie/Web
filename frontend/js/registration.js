// password confirmation code
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registrationForm");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const passwordError = document.getElementById("passwordError");

    function validatePassword() {
        if (password.value !== confirmPassword.value) {
            passwordError.textContent = "Passwords do not match!";
            confirmPassword.classList.add("is-invalid");
            confirmPassword.classList.remove("is-valid");
        } else {
            passwordError.textContent = "";
            confirmPassword.classList.remove("is-invalid");
            confirmPassword.classList.add("is-valid");
        }
    }

    confirmPassword.addEventListener("input", validatePassword);

    form.addEventListener("submit", function (event) {
        validatePassword();
        if (passwordError.textContent) {
            event.preventDefault(); 
        }
    });
});
