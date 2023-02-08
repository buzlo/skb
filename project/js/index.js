{
  const SERVER_PATH = 'http://localhost:3000',
    placeholder = document.getElementById('clients-placeholder'),
    clients = [],
    $clientRows = [];

  const getClientsData = async () => {
    const response = await fetch(`${SERVER_PATH}/api/clients`);
    const data = response.json();7
    return data;
  };

  const initClientsTable = async () => {
    const $newClientBtn = document.getElementById('new-client-btn'),
      $pageBody = document.getElementById('body');

    await updateClientsTable();

    addSortListeners();

    addSearchInputListener();

    $newClientBtn.addEventListener('click', () => {
      const $modal = createModal('new');
      $pageBody.append($modal);
    })

    async function updateClientsTable() {
      placeholder.classList.remove('d-none');
      const data = await getClientsData();
      clients.length = 0;
      for (let item of data) {
        clients.push(item);
      }
      const sortedClients = getSortedClients(clients, 'id');
      placeholder.classList.add('d-none');

      rebuildClientsTable(sortedClients);
    }

    function rebuildClientsTable(sortedClients) {

      for (let $clientRow of $clientRows) {
        $clientRow.remove();
      };
      $clientRows.length = 0;
      createClientsTable(sortedClients);
    }

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
            if ($elem.id === 'full-name-btn') {
              const $alphabet = $elem.querySelector('.thead__alphabet');
              $alphabet.textContent = 'А-Я';
            }
          }
        }
      }
    }

    function createClientsTable(clients) {
      const $tbody = document.getElementById('clients-tbody');
      for (let client of clients) {
        const $tr = addClientTR($tbody, client);
        $clientRows.push($tr);
      }

      initBsTooltips();

      function addClientTR($tbody, client) {
        const $tr = document.createElement('tr'),
          handlers = {
            onEdit(client) {
              createModal('edit', client);
            },
            onDelete(client) {
              createModal('delete', client);
            }
          };

        $tr.classList.add('clients__row');

        addIdTD($tr, client);
        addFullNameTD($tr, client);
        addDateTD($tr, client.createdAt);
        addDateTD($tr, client.updatedAt);
        addContactsTD($tr, client.contacts);
        addActionsTD($tr, client, handlers);

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

          function addContactsItem($ul, contact) {
            const type = contact.type,
              value = contact.value,
              id = type === 'Телефон' ? 'phone' :
                type === 'E-mail' ? 'email' :
                  type === 'Facebook' ? 'fb' :
                    type === 'VK' ? 'vk' :
                      'contact';

            const $item = document.createElement('li'),
              $link = document.createElement('a'),
              $svg = createSvg([`img/sprite.svg#${id}`]);

            $item.classList.add('contacts__item');
            $link.classList.add('contacts__link');
            $svg.classList.add('contacts__svg');

            $link.setAttribute('href', '#');
            $link.setAttribute('data-bs-toggle', 'tooltip');
            $link.setAttribute('data-bs-title', `${type} : ${value}`);

            $link.append($svg);
            $item.append($link);
            $ul.append($item);
          }
        }

        function addActionsTD($tr, client, { onEdit, onDelete }) {
          const $actionsTD = document.createElement('td'),
            $actionsWrapper = document.createElement('div'),
            $editBtn = createActionBtn('edit', client),
            $btn = createActionBtn('delete', client, onDelete);

          $actionsTD.classList.add('clients_actions', 'actions', 'col-3');
          $actionsWrapper.classList.add('actions__wrapper', 'flex')

          $actionsWrapper.append($editBtn, $btn);
          $actionsTD.append($actionsWrapper);
          $tr.append($actionsTD);

          function createActionBtn(action, client) {
            const $btn = document.createElement('button'),
              $span = document.createElement('span');

            let textContent = '',
              svgId = '';
            switch (action) {
              case 'edit':
                textContent = 'Изменить';
                svgId = 'pen';
                const $spinner = createSvg(['img/sprite.svg#spinner-small']);
                $spinner.classList.add('actions__svg', 'actions__svg_rotate', 'd-none');
                $btn.append($spinner);
                $btn.addEventListener('click', async () => {
                  $svg.classList.add('d-none');
                  $spinner.classList.remove('d-none');
                  const clientData = await getClientData(client.id);
                  $spinner.classList.add('d-none');
                  $svg.classList.remove('d-none');
                  onEdit(clientData);
                });
                break;
              case 'delete':
                textContent = 'Удалить';
                svgId = 'cross';
                $btn.addEventListener('click', () => onDelete(client));
                break;
            }

            $btn.classList.add('actions__btn', 'btn', 'flex');

            const $svg = createSvg([`img/sprite.svg#${svgId}`]);
            $svg.classList.add('actions__svg');

            $span.textContent = textContent;

            $btn.append($svg);
            $btn.append($span);
            return $btn;
          }
        }

      }

      function initBsTooltips() {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
      }

      async function getClientData(id) {
        const response = await fetch(`${SERVER_PATH}/api/clients/${id}`);
        const data = response.json();
        return data;
      }
    }

    function createModal(type, client) {
      const $modal = document.createElement('div'),
        $modalDialog = document.createElement('div'),
        $modalContent = document.createElement('div'),
        $modalHeader = createModalHeader(type, client),
        handlers = {
          onConfirm: null,
          onCancel: null,
        };

      $modal.setAttribute('tabindex', '-1');
      $modal.setAttribute('id', 'new-client-modal');

      $modal.classList.add('modal', 'fade');
      $modalDialog.classList.add('modal-dialog', 'modal-dialog-centered');
      $modalContent.classList.add('modal-content');

      switch (type) {
        case 'new':
          handlers.onConfirm = (newClientData) => {
            formSubmitHandler(newClientData, 'new');
          }
          break;
        case 'edit':
          handlers.onConfirm = (newClientData) => {
            formSubmitHandler(newClientData, 'edit', client.id);
          }
          break;
        case 'delete':
          handlers.onConfirm = deleteClient;
          break;
      }

      const $modalBody = createModalBody(type, client, handlers);

      $modalContent.append($modalHeader, $modalBody);
      $modalDialog.append($modalContent);
      $modal.append($modalDialog);

      const bsModalObj = new bootstrap.Modal($modal);

      $modal.addEventListener('hidden.bs.modal', () => {
        $modal.remove();
        bsModalObj.dispose();
      })
      bsModalObj.show();

      return $modal;

      function createModalHeader(type, client) {
        const $modalHeader = document.createElement('div'),
          $modalTitle = document.createElement('h1'),
          $closeButton = document.createElement('button');

        $modalHeader.classList.add('modal__header', 'modal-header');
        $modalTitle.classList.add('modal__title', 'modal-title');
        $closeButton.classList.add('modal__close', 'btn-close');

        $closeButton.setAttribute('type', 'button');
        $closeButton.setAttribute('data-bs-dismiss', 'modal');
        $closeButton.setAttribute('aria-label', 'Закрыть');

        switch (type) {
          case 'new':
            $modalTitle.textContent = 'Новый клиент';
            $modalHeader.append($modalTitle, $closeButton);
            break;
          case 'edit':
            $modalTitle.textContent = 'Изменить данные';
            const $modalClientId = document.createElement('h2');
            $modalClientId.classList.add('modal__client-id');
            $modalClientId.textContent = `ID: ${client.id}`;
            $modalHeader.append($modalTitle, $modalClientId, $closeButton);
            break;
          case 'delete':
            $modalTitle.textContent = 'Удалить клиента';
            $modalHeader.append($modalTitle, $closeButton);
            break;
        }

        return $modalHeader;
      }

      function formSubmitHandler(newClientData, action, clientId) {

        if (action === 'new') {
          postNewClient(newClientData);
        } else if (action === 'edit') {
          patchExistingClient(newClientData, clientId);
        } else return;

        async function postNewClient(clientData) {
          const response = await fetch(`${SERVER_PATH}/api/clients`, {
            method: "POST",
            body: JSON.stringify(clientData),
            headers: {
              'Content-Type': 'application/json',
            }
          });
          if (response.ok) {
            bsModalObj.hide();
            updateClientsTable();
          }
          return response;
        }

        async function patchExistingClient(clientData, clientId) {
          const response = await fetch(`${SERVER_PATH}/api/clients/${clientId}`, {
            method: "PATCH",
            body: JSON.stringify(clientData),
            headers: {
              'Content-Type': 'application/json',
            }
          });
          if (response.ok) {
            bsModalObj.hide();
            updateClientsTable();
          }
          return response;
        }

      }

      async function deleteClient(client) {
        const response = await fetch(`${SERVER_PATH}/api/clients/${client.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          bsModalObj.hide();
          updateClientsTable();
        }
      }

      function createModalBody(type, client, { onConfirm, onCancel }) {
        ``
        const $modalBody = document.createElement('div');

        $modalBody.classList.add('modal-body', 'modal__body', 'px-md-4');

        switch (type) {
          case 'new': {
            const $form = createForm(null, { onConfirm, onCancel }),
              { $modalConfirm, $modalCancel } = createModalBtnsObj('Сохранить', 'Отмена');

            $modalCancel.setAttribute('data-bs-dismiss', 'modal');
            $form.append($modalConfirm, $modalCancel);
            $modalBody.append($form);
            break;
          }
          case 'edit': {
            const $form = createForm(client, { onConfirm, onCancel }),
              { $modalConfirm, $modalCancel } = createModalBtnsObj('Сохранить', 'Удалить клиента');

            $modalCancel.setAttribute('data-bs-dismiss', 'modal');
            $modalCancel.addEventListener('click', () => {
              createModal('delete', client);
            })
            $form.append($modalConfirm, $modalCancel);
            $modalBody.append($form);
            break;
          }
          case 'delete': {
            const $modalText = document.createElement('p'),
              { $modalConfirm, $modalCancel } = createModalBtnsObj('Удалить', 'Отмена');

            $modalText.classList.add('modal__text');
            $modalText.textContent = 'Вы действительно хотите удалить данного клиента?';

            $modalConfirm.addEventListener('click', () => {
              onConfirm(client);
            })
            $modalCancel.setAttribute('data-bs-dismiss', 'modal');

            $modalBody.append($modalText, $modalConfirm, $modalCancel);
            break;
          }
        }

        return $modalBody;

        function createForm(clientData, { onConfirm }) {
          const $form = document.createElement('form'),
            inputNames = ['surname', 'name', 'lastName'],
            $inputsObj = {},
            contacts = clientData ? clientData.contacts : null,
            contactItemObjs = [],
            $formContactsBlock = createFormContactsBlock(contacts, contactItemObjs);

          for (let name of inputNames) {
            const placeholder = name === 'surname' ? 'Фамилия' : name === 'name' ? 'Имя' : name === 'lastName' ? 'Отчество' : '',
              required = name === 'surname' || name === 'name',
              $input = document.createElement('input');

            $input.setAttribute('type', 'text');
            $input.setAttribute('name', name);
            $input.setAttribute('placeholder', placeholder);
            $input.setAttribute('id', `modal-${name}`);
            if (required) $input.setAttribute('required', true);
            $input.classList.add('modal__input', 'form-control');
            $inputsObj[`$${name}Input`] = $input;
          }

          $form.setAttribute('id', 'new-client-form');
          $form.classList.add('modal__form', 'requires-validation', 'flex');

          for (let key in $inputsObj) {
            const $label = document.createElement('label');
            $label.classList.add('form-label', 'modal__input-label');
            if ($inputsObj[key].required) {
              $label.classList.add('modal__input-label_required');
            }
            $label.setAttribute('for', $inputsObj[key].id);
            $label.textContent = $inputsObj[key].placeholder;
            if (clientData) {
              const inputName = $inputsObj[key].name;
              $inputsObj[key].value = clientData[inputName];
            } else {
              $label.classList.add('opacity-0');
            }
            $form.append($label, $inputsObj[key]);
          }

          $form.append($formContactsBlock);

          $form.addEventListener('submit', () => {
            const newClientData = {
              ...clientData,
              surname: $inputsObj.$surnameInput.value,
              name: $inputsObj.$nameInput.value,
              lastName: $inputsObj.$lastNameInput.value,
              contacts: null,
            }

            if (contactItemObjs.length !== 0) {
              newClientData.contacts = (getContactsFromItemsArr(contactItemObjs));
            }

            onConfirm(newClientData);
          })

          return $form;

          function createFormContactsBlock(contacts, contactItemObjs) {
            const $formContactsBlock = document.createElement('div'),
              $contactsList = document.createElement('ul'),
              $newContactBtn = document.createElement('button'),
              $newContactSvg = createSvg([
                "img/sprite.svg#plus",
                "img/sprite.svg#plus-hover",
              ]),
              $newContactBtnText = document.createElement('span');

            $formContactsBlock.classList.add('modal__form-contacts', 'form-contacts', 'flex', 'mx-md-n4', 'px-md-4', 'mx-n3', 'px-3');
            $contactsList.classList.add('form-contacts__list');

            if (contacts) {
              for (let contact of contacts) {
                const $contactItem = createNewContactItem(contactItemObjs, removeContactItem, contact);
                $contactsList.append($contactItem);
              }
            }

            $newContactBtn.classList.add('form-contacts__btn', 'btn', 'flex');
            $newContactSvg.setAttribute('viewBox', '0 0 14 14')
            $newContactBtnText.textContent = 'Добавить контакт';
            $newContactBtn.append($newContactSvg, $newContactBtnText);

            $newContactBtn.addEventListener('click', (event) => {
              event.preventDefault();
              const $contactItem = createNewContactItem(contactItemObjs, removeContactItem);
              $contactsList.append($contactItem);
              if (contactItemObjs.length > 9) $newContactBtn.classList.add('d-none');
            });

            $formContactsBlock.append($contactsList);
            $formContactsBlock.append($newContactBtn);

            return $formContactsBlock;

            function createNewContactItem(contactItemObjs, onRemove, contact) {
              const $contactItem = document.createElement('li'),
                $inputGroup = document.createElement('div'),
                $select = createSelect(),
                $input = document.createElement('input'),
                contactItemObj = { $contactItem, $select, $input },
                $removeBtn = createRemoveContactBtn(contactItemObj, contactItemObjs, onRemove);

              $contactItem.classList.add('form-contacts__item');
              $inputGroup.classList.add('form-contacts__input-group', 'input-group');
              $input.classList.add('form-contacts__text-input', 'form-control');
              $input.setAttribute('type', 'text')

              if (contact) {
                $select.value = contact.type;
                if (!$select.value) $select.value = 'Другое';
                $input.value = contact.value;
              }

              $inputGroup.append($select, $input, $removeBtn);
              createChoicesFromSelect($select);

              $contactItem.append($inputGroup);
              contactItemObjs.push(contactItemObj);

              return $contactItem;

              function createSelect(optionsData = [
                { value: 'Телефон', name: 'Телефон' },
                { value: 'E-mail', name: 'E-mail' },
                { value: 'VK', name: 'VK' },
                { value: 'Facebook', name: 'Facebook' },
                { value: 'Другое', name: 'Другое' },
              ]) {

                const $select = document.createElement('select');

                for (let item of optionsData) {
                  const $option = document.createElement('option'),
                    value = item.value,
                    name = item.name;
                  if (value) {
                    $option.setAttribute('value', value)
                  }
                  $option.textContent = name;
                  $select.append($option);
                }
                return $select;
              }

              function createRemoveContactBtn(contactItemObj, contactItemObjs, onRemove) {
                const $btn = document.createElement('button'),
                  $svg = createSvg(['img/sprite.svg#cross']);

                $btn.classList.add('form-contacts__remove', 'remove', 'input-group-text');
                $btn.setAttribute('type', 'button');
                $btn.addEventListener('click', () => {
                  onRemove(contactItemObj, contactItemObjs);
                })

                $btn.append($svg);

                return $btn;
              }

              function createChoicesFromSelect($select) {
                const choices = new Choices($select, {
                  searchEnabled: false,
                  itemSelectText: '',
                  shouldSort: false,
                  allowHTML: false,
                  classNames: {
                    inputCloned: 'choices__input_cloned',
                    listItems: 'choices__list_multiple',
                    listSingle: 'choices__list_single',
                    listDropdown: 'choices__list_dropdown',
                    itemSelectable: 'choices__item_selectable',
                    itemDisabled: 'choices__item_disabled',
                    itemChoice: 'choices__item_choice',
                  },
                }),
                  $choices = $inputGroup.querySelector('.choices'),
                  $choicesItemsArr = $choices.querySelectorAll('.choices__item');

                $choices.classList.add('input-group-text', 'form-control', 'form-contacts__select');
                $choicesItemsArr.forEach($item => $item.classList.add('form-contacts__option'));
              }
            }

            function removeContactItem(contactItemObj, contactItemObjs) {
              contactItemObj.$contactItem.remove();
              const removedItemIndex = contactItemObjs.indexOf(contactItemObj);
              contactItemObjs.splice(removedItemIndex, 1);

              $newContactBtn.classList.remove('d-none');
            }
          }

          function getContactsFromItemsArr(contactItemsArr) {
            return contactItemsArr.map((item) => {
              return {
                type: item.$select.value,
                value: item.$input.value,
              };
            });
          }

        }

        function createModalBtnsObj(confirmText, cancelText) {
          const $modalConfirm = document.createElement('button'),
            $modalCancel = document.createElement('button');

          $modalConfirm.setAttribute('type', 'submit');
          $modalConfirm.classList.add('modal__confirm', 'btn', 'btn-primary');
          $modalConfirm.textContent = confirmText;

          $modalCancel.setAttribute('type', 'reset');
          $modalCancel.classList.add('modal__cancel', 'btn', 'btn-link');
          $modalCancel.textContent = cancelText;

          return { $modalConfirm, $modalCancel };
        }
      }
    }

    function addSearchInputListener() {
      const $searchInput = document.getElementById('search-input');
      let timeout = null;

      $searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
          placeholder.classList.remove('d-none');
          const searchedClients = await searchClients($searchInput.value);
          rebuildClientsTable(searchedClients);
          placeholder.classList.add('d-none');
      }, 500);
      });

      async function searchClients(searchQuery) {
        let url = new URL(`${SERVER_PATH}/api/clients`);
        url.searchParams.set('search', searchQuery);
        response = await fetch(url);
        const data = response.json();
        return data;
      }
    }
  };

  window.initClientsTable = initClientsTable;

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

  function createSvg(paths) {
    const SVG_NS = 'http://www.w3.org/2000/svg',
      XLINK_NS = 'http://www.w3.org/1999/xlink',
      $svg = document.createElementNS(SVG_NS, 'svg');
    for (let path of paths) {
      $use = document.createElementNS(SVG_NS, 'use');
      $use.setAttributeNS(XLINK_NS, 'xlink:href', path);
      $svg.append($use);
    }
    return $svg;
  }
}

