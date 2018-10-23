const isValid = (errors, name) => {
    return errors.filter(e => e.param === name).length === 0;
};

const renderInputErrors = (errors = [], name) => `
  <div class="invalid-feedback">
  ${ errors.filter(e => e.param === name)
        .map(e => e.msg)
        .join(', ') }
  </div>
`;

const renderInput = ({
    name,
    value,
    type,
    label,
    errors = [],
}) => `
    <div class='form-group'>
        <label for="${ name }">${ label }:</label>
        <input
            type='${ type }'
            class='form-control${ isValid(errors, name) ? "" : " is-invalid" }'
            name='${ name }'
            id='${ name }'
            value='${ value || "" }'
        >
        ${ renderInputErrors(errors, name) }
    </div>
`;

module.exports = {
    renderInput,
    renderInputErrors,
};
