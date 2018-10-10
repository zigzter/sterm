for (let i = 0; i < 7; i += 1) {
    const dropChoice = document.createElement('div');
    dropChoice.classList.add('dropChoice');
    $('#dropZone').append(dropChoice);
}

for (let i = 0; i < 42; i += 1) {
    const square = document.createElement('div');
    square.classList.add('csquare', 'chole', 'd-flex', 'justify-content-center', 'align-items-center');
    square.id = `s${ i }`;
    $('#cgame').append(square);
}
