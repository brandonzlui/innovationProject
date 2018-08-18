function login(bookingReference) {
  $.ajax({
    dataType: 'json',
    url: './login',
    method: "POST",
    data: { 
      bookingReference: bookingReference
    },
    async: true,
    success: loginSuccess,
    error: loginError
  });
}

function loginSuccess(data, status, jqXHR) {
  if (!data.success) return
  localStorage.setItem('flightCode', data.flightCode)
  localStorage.setItem('flightSeat', data.flightSeat)
  redirect()
}

function loginError(jqXHR, status, error) {
  alert(error)
}

function redirect() {
  location.href = './index'
}

$('#login').submit(event => {
  event.preventDefault()

  login($('#bookingReference').val())
})