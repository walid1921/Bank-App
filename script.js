'use strict';


//! Data

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-08-27T17:01:17.194Z',
    '2022-10-19T23:36:17.929Z',
    '2022-10-23T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'de-DE', // ar-SY
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];



//! Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');


// ! Functions
const dateFormater = function (date, locale) {


  const calcDays = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDays(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // const hours = `${date.getHours()}`.padStart(2, 0);
  // const min = `${date.getMinutes()}`.padStart(2, 0);
  // return `${day}/${month}/${year}, ${hours}:${min}`;

};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(value);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 sec, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Long in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;

  }
  // set time to 5 min
  let time = 300;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};



// ! Display Movements
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = ''; // same like we usually do textContent = 0, its for removing the old info 

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function (mov, i) {

    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = dateFormater(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMov}</div>
        </div>
      `;

    containerMovements.insertAdjacentHTML('afterbegin', html);

  });

};

// ! Display Balance : how we made the balance from all the movements
const calcDisplayBalance = function (acc) {

  acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};



//! The magic of chaining methods
const calcDisplaySummary = function (acc) {

  const incomes = acc.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0)
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const outcomes = acc.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0)
  labelSumOut.textContent = formatCur(Math.abs(outcomes), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

//! Computing Usernames : "Jonas Schmedtmann" => username: 'js'
const createUserNames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner.toLowerCase().split(' ').map(name => name[0]).join('');
  });
};
createUserNames(accounts);



//! Implementing Login (event handler)
const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};



let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value)
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {

    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100;

    // Create current date and time
    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
      weekday: 'long',
    };
    // const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);


    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hours = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hours}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';

    // For despairing the focus
    inputLoginPin.blur();
    inputLoginUsername.blur();

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  };
});


// ! Implementing Transfers
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);

  // clean  out the inputs
  inputTransferAmount.value = inputTransferTo.value = '';

  if (amount > 0 && receiverAcc && currentAccount.balance >= amount && receiverAcc?.username !== currentAccount.username) {
    setTimeout(function () {
      // Doing the Transfer
      currentAccount.movements.push(-amount); // withdrawal
      receiverAcc.movements.push(amount); // deposit

      // Add transfer date
      currentAccount.movementsDates.push(new Date().toISOString());
      receiverAcc.movementsDates.push(new Date().toISOString());


      // Update UI
      updateUI(currentAccount);

      // rest timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
});


// ! Implementing loan (event handler), 'using some method'
// this btn for making deposit in own account
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value); // we add Math.floor to not have decimal num

  // condition in the flowchart (any deposit > 10% of Request => * 0,1) 'any' it means we use some method
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movements
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // rest timer
      clearInterval(timer);
      timer = startLogOutTimer();

    }, 2500);
  };

  // clean out the input
  inputLoanAmount.value = '';
});


//! Implementing close (event handler)
btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  // Confirmation of the account
  if (inputCloseUsername.value === currentAccount.username && +inputClosePin.value === currentAccount.pin) {

    const index = accounts.findIndex(acc => acc.username === currentAccount.username);

    console.log(index);


    //Delete account 
    accounts.splice(index, 1);

    // hide UI
    containerApp.style.opacity = 0;


    labelWelcome.textContent = 'Jonas account deleted';
    labelWelcome.style.color = '#e52a5a';

  };

  // clean out the inputs
  inputCloseUsername.value = inputClosePin.value = '';

});


//! Implementing sort
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});





