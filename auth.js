/*! flexAuth.js v1.0 | lightweight localStorage auth handler */
;(() => {

const flexAuth = (() =>
{
const key = 'auth_users'
const _save = _0 => localStorage.setItem(key, JSON.stringify(_0))
const _load = () => JSON.parse(localStorage.getItem(key) || '{}')

const _collect = _form =>
{
const obj = {}
_form.querySelectorAll('[data]').forEach(_0 =>
{
const field = _0.getAttribute('data').toLowerCase().trim()
obj[field] = _0.value.trim()
})
return obj
}

const register = _form =>
{
const data = _load()
const form = _collect(_form)
const idKey = form.username || form.email || form.name
if(!idKey) return {ok:false,msg:'no id'}
if(form.password !== form.confirmpassword) return {ok:false,msg:'password mismatch'}
data[idKey] = form
_save(data)
localStorage.setItem('auth_user', idKey)
return {ok:true,msg:'registered'}
}

const login = _form =>
{
const data = _load()
const form = _collect(_form)
const idKey = form.username || form.email || form.name
if(!idKey || !data[idKey]) return {ok:false,msg:'not found'}
const valid = data[idKey].password === form.password
if(valid) localStorage.setItem('auth_user', idKey)
return {ok:valid,msg:valid?'authenticated':'invalid password'}
}

const logout = () => localStorage.removeItem('auth_user')
const isAuth = () => !!localStorage.getItem('auth_user')

return {register,login,logout,isAuth}
})()

const _redirectTo = _url =>
{
fetch(_url)
.then(r => r.text())
.then(html =>
{
document.body.innerHTML = ''
document.body.insertAdjacentHTML('beforeend', html)
history.pushState({}, '', _url)
location.reload()
})
}

// auto-state logic
const _handleAuthState = () =>
{
const isAuth = flexAuth.isAuth()
if(typeof _authState === 'undefined') return
if(_authState === 'index' && !isAuth) return _redirectTo('new.html')
if(_authState === 'new' && isAuth) return _redirectTo('index.html')
}

// init after DOM
document.addEventListener('DOMContentLoaded', () =>
{
_handleAuthState()

document.body.addEventListener('mousedown', e =>
{
const btn = e.target.closest('button[btn]')
if(!btn) return
e.preventDefault()
const form = btn.closest('form')
if(!form) return

const label = btn.textContent.toLowerCase()
let res
if(label.includes('login')) res = flexAuth.login(form)
if(label.includes('signup') || label.includes('register')) res = flexAuth.register(form)

if(res?.ok) _redirectTo('index.html')
else if(res) alert(res.msg)
})

document.querySelector('#logout')?.addEventListener('mousedown', () =>
{
flexAuth.logout()
_redirectTo('new.html')
})
})

// expose globally
window.flexAuth = flexAuth
window._redirectTo = _redirectTo

})()
