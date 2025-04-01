fetch('/nav/header.html')
    .then(response => {
        if (!response.ok) {
            throw new Error('Header file not found');
        }
        return response.text();
    })
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;
    })
    .catch(error => {
        console.error('Error loading header:', error);
    });

fetch('/nav/footer.html')
    .then(response => {
        if (!response.ok) {
            throw new Error('Footer file not found');
        }
        return response.text();
    })
    .then(data => {
        document.getElementById('footer-placeholder').innerHTML = data;
    })
    .catch(error => {
        console.error('Error loading footer:', error);
    });

// taking all input values
const nameInput = document.getElementById("username")
const emailInput = document.getElementById("email")
const passInput = document.getElementById("password")
const confirmPassInput = document.getElementById("confirmPassword")


// creating user
document.getElementById("registrationForm").addEventListener("submit", async function(event) {
    event.preventDefault();


    const name = nameInput.value;
    const email = emailInput.value;
    const password = passInput.value;
    const confirmPassword = confirmPassInput.value;


    if(password == confirmPassword){
        const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json()
        if(data?.status == 201){
            nameInput.value=""
            emailInput.value=""
            passInput.value=""
            confirmPassInput.value=""
            alert(`${name}, your account created successfully`)
        } else if(data?.status == 400){
            alert("this email already is in use")
        }
    }else{
        alert("password didn't match")
    }
});

