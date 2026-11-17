import apiHelper from '../../../helpers/apiHelper'

const todoApi = (() => {
  async function getTodos() {
    const res = await apiHelper.fetchData('/todos')
    return res.data
  }

  async function createTodo(data) {
    const res = await apiHelper.fetchData('/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res.data
  }

  async function updateTodo(id, data) {
    const res = await apiHelper.fetchData(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return res.data
  }

  async function deleteTodo(id) {
    const res = await apiHelper.fetchData(`/todos/${id}`, {
      method: 'DELETE',
    })
    return res.data
  }

  async function generateAiTodos(data) {
    const res = await apiHelper.fetchData('/todos/ai-generate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res.data
  }

  async function getStats() {
    const res = await apiHelper.fetchData('/todos/stats')
    return res.data
  }

  return {
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    generateAiTodos,
    getStats,
  }
})()

export default todoApi
