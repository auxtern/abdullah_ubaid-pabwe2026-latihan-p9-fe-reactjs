import apiHelper from '../../../helpers/apiHelper'

const authApi = (() => {
  async function login(username, password) {
    const res = await apiHelper.fetchData('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    return res.data
  }

  async function register(username, email, password) {
    const res = await apiHelper.fetchData('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    })
    return res.data
  }

  async function getProfile() {
    const res = await apiHelper.fetchData('/auth/profile')
    return res.data
  }

  return {
    login,
    register,
    getProfile,
  }
})()

export default authApi
