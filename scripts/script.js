// scripts for sign in page 
const user = JSON.parse(localStorage.getItem('user'));
const userId = user?.id;
const userEmail = user?.email;

    // scripts for home page
fetch('../sections/header.html')
  .then(response => response.text())
  .then(data => {
      document.getElementById('header').innerHTML = data;

      if (userId) {
        uname = userEmail.split('@')[0];
        document.getElementById("loginOrProfile").innerHTML = `<a class="nav-link btn btn-outline-primary" href="../pages/profile.html">${uname}</a>`;
      } else {
        document.getElementById("loginOrProfile").innerHTML = `<a class="nav-link btn btn-outline-primary" href="../pages/signin.html">Sign In</a>`;
      }
  });
fetch('../sections/footer.html')
  .then(response => response.text())
  .then(data => {
      document.getElementById('footer').innerHTML = data;
  });


document.getElementById('signinForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const response = await fetch('http://127.0.0.1:3000/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include', 
  });

  const data = await response.json();
  console.log(data);
  if (data.success) {
    alert('You logged in successfully.');
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = '../index.html';
  } else {
    alert('Login failed.');
  }
});


    // scripts for register page 
    document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('fullName').value;
      const password = document.getElementById('regPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const email = document.getElementById('regEmail').value;

      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, password,email })
      });

      const data = await response.json();
      if (data.success) {
        alert('Registration successful! Please login.');
        window.location.href = '../pages/signin.html';
      } else {
        alert('Registration failed.');
      }
      console.log({fullName,password,email},data)
    });

// script for donation compliation

    document.getElementById('donationForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      const donorName = document.getElementById('donorName').value;
      const donorEmail = document.getElementById('donorEmail').value;
      const donateAmount = document.getElementById('donateAmount').value;
      const donateCurrency = document.getElementById('donateCurrency').value;
      const donateMessage = document.getElementById('donateMessage').value;
      let donorInfo = [];
      if(userId){
        donorInfo={donorName,donorEmail,donateAmount,donateCurrency,donateMessage,userId}
      }
      else{
        const userChoice = window.confirm("Your are not logged in. Donation will be anonymous. Do you want to proceed?")
        if(userChoice){
          donorInfo={donorName,donorEmail,donateAmount,donateCurrency,donateMessage,userId: ''}
        }
        else{
          document.getElementById('donorName').value = '';
          document.getElementById('donorEmail').value = '';
          document.getElementById('donateAmount').value = '';
          document.getElementById('donateMessage').value = '';
          return;
        }
      }
  
      fetch('http://localhost:3000/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donorInfo)
      })
      .then(res => res.json())
      .then(data => {
        
        if(data.success){
          localStorage.setItem('donorName', JSON.stringify(donorName));
          localStorage.setItem('donateAmount', JSON.stringify(donateAmount));
          localStorage.setItem('donateCurrency', JSON.stringify(donateCurrency));

          alert(`thanks for donating us ${data?.donation?.donateamount} ${data?.donation?.donatecurrency}`)

          window.location.href='../pages/thanks.html'
        }
      })
      .catch(err => console.error('Donation failed:', err));
      
    });

    // script for partner compliation

    // document.getElementById('partnerForm').addEventListener('submit', function(e) {
    //   e.preventDefault();
    //   alert('🎉 Thank you! Our team will contact you shortly.');
    //   this.reset();
    // });

    // scripts for register page 
    document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const profileForm = document.getElementById('profileForm');
      const fullName = profileForm.querySelector('#fullName').value;
      const password = profileForm.querySelector('#regPassword').value;
      const confirmPassword = profileForm.querySelector('#confirmPassword').value;
      const email = profileForm.querySelector('#regEmail').value;

      if(!fullName){
        alert("Name cannot be empty.");
        return;
      }
      if(password || confirmPassword){
        if(password != confirmPassword){
          profileForm.querySelector('#regPassword').value = '';
          profileForm.querySelector('#confirmPassword').value = '';
          alert("Possword does not match.");
          return;
        }
      }

      const response = await fetch('http://localhost:3000/user/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, password, confirmPassword, email, id: userId })
      });

      const data = await response.json();
      if (data.success) {
        alert('Profile updated successfully!');
      } else {
        alert(data.message);
      }
      console.log(data)
    });

// script for thanks page 

    const donorName=localStorage.getItem('donorName')
    const donateAmount=localStorage.getItem('donateAmount')
    const donateCurrency=localStorage.getItem('donateCurrency')

    document.querySelector('#donorName').textContent = JSON.parse(donorName);
    document.querySelector('#donateAmount').textContent = `${JSON.parse(donateAmount)} ${JSON.parse(donateCurrency)}`;