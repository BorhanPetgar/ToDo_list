const draggables = document.querySelectorAll('.draggable')
const containers = document.querySelectorAll('.container')

draggables.forEach(draggable => {
  draggable.addEventListener('dragstart', () => {
    draggable.classList.add('dragging')
  })

  draggable.addEventListener('dragend', () => {
    draggable.classList.remove('dragging')
  })
})

containers.forEach(container => {
  container.addEventListener('dragover', e => {
    e.preventDefault()
    const afterElement = getDragAfterElement(container, e.clientY)
    const draggable = document.querySelector('.dragging')
    if (afterElement == null) {
      container.appendChild(draggable)
    } else {
      container.insertBefore(draggable, afterElement)
    }
  })
})

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')]

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = y - box.top - box.height / 2
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child }
    } else {
      return closest
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element
}


var row;
var startY;

function start() {
    row = event.target;
    startY = event.clientY;
}

function dragover() {
    var e = event;
    e.preventDefault();
  
    let targetRow = e.target.closest('tr');
    let targetRowIndex = Array.from(targetRow.parentNode.children).indexOf(targetRow);
    let draggedRowIndex = Array.from(row.parentNode.children).indexOf(row);
  
    if (Math.abs(event.clientY - startY) < 10 || targetRow === row || !targetRow) {
      return;
    }
  
    if (targetRowIndex > draggedRowIndex) {
      targetRow.after(row);
    } else {
      targetRow.before(row);
    }
  }

function toggleTaskCompletion(checkbox) {
    var row = checkbox.parentNode.parentNode;
    row.classList.toggle("completed-task");
}

function deleteTask(button) {
    console.log(button.dataset);
    console.log('hi');
    const endpoint = `/todo/${button.dataset.doc}`; 

    fetch(endpoint, { 
        method: 'DELETE', 
    }) 
    .then(response => response.json()) 
    .then(data => window.location.href = data.redirect) 
    .catch(err => console.log(err)); 

    var row = button.parentNode.parentNode;
    console.log(row);
    row.parentNode.removeChild(row);
}