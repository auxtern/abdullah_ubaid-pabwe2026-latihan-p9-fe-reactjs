import apiHelper from '../../../helpers/apiHelper'

const templateApi = (() => {
  async function getTemplates() {
    const res = await apiHelper.fetchData('/templates')
    return res.data
  }

  async function cloneTemplate(id) {
    const res = await apiHelper.fetchData(`/templates/${id}/clone`, {
      method: 'POST',
    })
    return res.data
  }

  async function createTemplate(data) {
    const res = await apiHelper.fetchData('/todo-groups', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        is_public: true,
      }),
    })
    return res.data
  }

  return {
    getTemplates,
    cloneTemplate,
    createTemplate,
  }
})()

export default templateApi
