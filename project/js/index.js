const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

{
  const SERVER_PATH = 'http://localhost:3000';

  const initClientsTable = async () => {
    const data = await getClientsData();
    createClientsTable(data);
  };

  window.initClientsTable = initClientsTable;

  const getClientsData = async () => {
    const response = await fetch(`${SERVER_PATH}/api/clients`);
    const data = response.json();
    return data;
  };

  const createClientsTable = (clients) => {
    const $tbody = document.getElementById('clients-tbody');
    for (let client of clients) {
      const $tr = document.createElement('tr');
      const $idTD = document.createElement('td');
      const $fullNameTD = document.createElement('td');
    }
  };
}
