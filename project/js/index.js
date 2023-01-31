{
  const SERVER_PATH = 'http://localhost:3000',
    placeholder = document.getElementById('clients-placeholder'),
    clients = [],
    $clientRows = [];

  const getClientsData = async () => {
    const response = await fetch(`${SERVER_PATH}/api/clients`);
    const data = response.json();
    return data;
  };

  const initClientsTable = async () => {
    placeholder.classList.remove('d-none');
    const data = await getClientsData();
    for (let item of data) {
      clients.push(item);
    }
    const sortedClients = getSortedClients(clients, 'id');
    placeholder.classList.add('d-none');

    createClientsTable(sortedClients);

    addSortListeners();

    function addSortListeners() {
      const $idBtn = document.getElementById('id-btn'),
        $fullNameBtn = document.getElementById('full-name-btn'),
        $createdAtBtn = document.getElementById('created-at-btn'),
        $updatedAtBtn = document.getElementById('updated-at-btn');

      const $buttons = [$idBtn, $fullNameBtn, $createdAtBtn, $updatedAtBtn];

      for (let $button of $buttons) {
        const parameter = getParameterFromId($button.id);
        $button.addEventListener('click', () => {

          if ($button.classList.contains('active')) {

            const direction = toggleSortDirection($button);
            const sortedClients = getSortedClients(clients, parameter, direction);
            rebuildClientsTable(sortedClients);

          } else {

            deactivateSortButtons($buttons);

            $button.classList.add('active', 'active_up');
            const $use = $button.querySelector('use');
            $use.setAttribute('xlink:href', `img/sprite.svg#arrow-up`);

            const sortedClients = getSortedClients(clients, parameter, 'up');
            rebuildClientsTable(sortedClients);

          }
        })
      }

      function getParameterFromId(id) {
        return id.split('-')
          .map(
            (word, index) => index == 0 ? word : word[0].toUpperCase() + word.slice(1)
          )
          .slice(0, -1)
          .join('');
      }

      function toggleSortDirection($button) {
        $button.classList.toggle('active_up');
        $button.classList.toggle('active_down');
        const direction = $button.classList.contains('active_up') ? 'up' : 'down';
        const $use = $button.querySelector('use');
        $use.setAttribute('xlink:href', `img/sprite.svg#arrow-${direction}`);
        if ($button.id === 'full-name-btn') {
          const $alphabet = $button.querySelector('.thead__alphabet');
          $alphabet.textContent = $alphabet.textContent.split('').reverse().join('');
        }

        return direction;
      }

      function deactivateSortButtons($elems) {
        for (let $elem of $elems) {
          if ($elem.classList.contains('active')) {
            $elem.classList.remove('active', 'active_up', 'active_down');
            const $use = $elem.querySelector('use');
            $use.setAttribute('xlink:href', `img/sprite.svg#arrow-up`);
          }
        }
      }
    }
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  };

  window.initClientsTable = initClientsTable;

  function getSortedClients(clients, parameter, direction) {
    const value = direction === 'down' ? 1 : -1;
    if (parameter === 'fullName') {
      return clients.slice().sort((a, b) => {
        let fullNameA = getFullName(a).toLowerCase().split(' ').join(''),
          fullNameB = getFullName(b).toLowerCase().split(' ').join('');
        return fullNameA.localeCompare(fullNameB) * (-value);
      })
    }
    return clients.slice().sort((a, b) => {
      if (a[parameter] < b[parameter]) return value
      else return -value;
    })
  }

  function rebuildClientsTable(sortedClients) {

    for (let $clientRow of $clientRows) {
      $clientRow.remove();
    };
    $clientRows.length = 0;
    createClientsTable(sortedClients);
  }

  function createClientsTable(clients) {
    const $tbody = document.getElementById('clients-tbody');
    for (let client of clients) {
      const $tr = addClientTR($tbody, client);
      $clientRows.push($tr);
    }

    function addClientTR($tbody, client) {
      const $tr = document.createElement('tr');
      $tr.classList.add('clients__row');

      addIdTD($tr, client);
      addFullNameTD($tr, client);
      addDateTD($tr, client.createdAt);
      addDateTD($tr, client.updatedAt);
      addContactsTD($tr, client.contacts);
      addActionsTD($tr);

      $tbody.append($tr);

      return $tr;

      function addIdTD($tr, client) {
        const $idTD = document.createElement('td');
        $idTD.classList.add('clients__id', 'col-1');
        $idTD.textContent = client.id;
        $tr.append($idTD);
      }

      function addFullNameTD($tr, client) {
        const $fullNameTD = document.createElement('td');
        $fullNameTD.classList.add('clients__full-name', 'col-3');
        $fullNameTD.textContent = getFullName(client);
        $tr.append($fullNameTD);
      }

      function addDateTD($tr, dateAndTime) {
        const $dateTD = document.createElement('td'),
          date = getDate(dateAndTime),
          time = getTime(dateAndTime);

        $dateTD.classList.add('clients__date', 'col-2');
        $dateTD.textContent = date;

        const $time = document.createElement('span');
        $time.classList.add('clients__time');
        $time.textContent = time;

        $dateTD.append($time);

        $tr.append($dateTD);
      }

      function addContactsTD($tr, contacts) {
        const $contactsTD = document.createElement('td'),
          $contactsList = document.createElement('ul');

        $contactsTD.classList.add('clients__contacts', 'contacts', 'col-1');
        $contactsList.classList.add('contacts__list', 'flex');

        for (let contact of contacts) {
          addContactsItem($contactsList, contact);
        }

        $contactsTD.append($contactsList);
        $tr.append($contactsTD);
      }

      function addContactsItem($ul, contact) {
        const SVG_NS = 'http://www.w3.org/2000/svg',
          XLINK_NS = 'http://www.w3.org/1999/xlink',
          type = contact.type,
          value = contact.value,
          id = type === 'Телефон' ? 'phone' :
            type === 'E-mail' ? 'email' :
              type === 'Facebook' ? 'fb' :
                type === 'VK' ? 'vk' :
                  'contact';

        const $item = document.createElement('li'),
          $link = document.createElement('a'),
          $svg = document.createElementNS(SVG_NS, 'svg'),
          $use = document.createElementNS(SVG_NS, 'use');

        $item.classList.add('contacts__item');
        $link.classList.add('contacts__link');
        $svg.classList.add('contacts__svg');

        $link.setAttribute('href', '#');
        $link.setAttribute('data-bs-toggle', 'tooltip');
        $link.setAttribute('data-bs-title', `${type} : ${value}`);

        $use.setAttributeNS(XLINK_NS, 'xlink:href', `img/sprite.svg#${id}`);

        $svg.append($use);
        $link.append($svg);
        $item.append($link);
        $ul.append($item);
      }

      function addActionsTD($tr) {
        const $actionsTD = document.createElement('td'),
          $actionsWrapper = document.createElement('div');

        $actionsTD.classList.add('clients_actions', 'actions', 'col-3');
        $actionsWrapper.classList.add('actions__wrapper', 'flex')
        addActionBtn($actionsWrapper, 'edit');
        addActionBtn($actionsWrapper, 'delete');

        $actionsTD.append($actionsWrapper);
        $tr.append($actionsTD);
      }

      function addActionBtn($target, action) {
        const SVG_NS = 'http://www.w3.org/2000/svg',
          XLINK_NS = 'http://www.w3.org/1999/xlink',
          $btn = document.createElement('button'),
          $svg = document.createElementNS(SVG_NS, 'svg'),
          $use = document.createElementNS(SVG_NS, 'use'),
          $span = document.createElement('span');

        let textContent = '',
          svgId = '';
        switch (action) {
          case 'edit':
            textContent = 'Удалить';
            svgId = 'pen';
            break;
          case 'delete':
            textContent = 'Удалить';
            svgId = 'cross';
            break;
        }

        $btn.classList.add('actions__btn', 'btn', 'flex');
        $svg.classList.add('contacts__svg');

        $use.setAttributeNS(XLINK_NS, 'xlink:href', `img/sprite.svg#${svgId}`);

        $span.textContent = textContent;

        $svg.append($use);
        $btn.append($svg);
        $btn.append($span);
        $target.append($btn);
      }
    }
  }

  function getFullName(object) {
    return object.surname + ' ' + object.name + ' ' + object.lastName;
  }

  function getDate(string) {
    const date = new Date(string),
      day = ('0' + date.getDate()).slice(-2),
      month = ('0' + (Number(date.getMonth()) + 1)).slice(-2),
      year = date.getFullYear();
    return day + '.' + month + '.' + year;
  }

  function getTime(string) {
    const date = new Date(string),
      hours = ('0' + date.getHours()).slice(-2),
      minutes = ('0' + date.getMinutes()).slice(-2);
    return hours + ':' + minutes;
  }
}

