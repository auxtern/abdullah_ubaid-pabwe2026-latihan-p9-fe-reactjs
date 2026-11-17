import apiHelper from '../../../helpers/apiHelper'

const adminApi = (() => {
  async function getUsers() {
    const res = await apiHelper.fetchData('/admin/users')
    return res.data
  }

  async function getUserTodos(userId) {
    const res = await apiHelper.fetchData(`/admin/users/${userId}/todos`)
    return res.data
  }

  return {
    getUsers,
    getUserTodos,
  }
})()

export default adminApi
