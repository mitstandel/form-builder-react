import { Component } from "react";
import Select from "react-select";
import { Field } from "redux-form";

export const renderSelect = (props) => (
  <div>
    <Select
      {...props}
      className="react-select__container"
      classNamePrefix="react-select"
      value={props.input.value}
      onChange={(value) => props.input.onChange(value)}
      onBlur={() => props.input.onBlur()}
      options={props.options}
      isSearchable={false}
      styles={{
        control: (base) => ({
          ...base,
          border: '1px solid #CBCBCB',
          boxShadow: 'none',
          '&:hover': {
            border: '1px solid black',
          }
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused ? '#DDDDDD' : 'white',
          color: '#000000'
        })
      }}
    />
    {props.meta.touched && (props.meta.error && (
      <span className="text-danger small">
        <i className="fa fa-exclamation-circle text-danger" />&nbsp;&nbsp;{props.meta.error}
      </span>
    ))}
  </div>
);

class ReduxField extends Component {
  _dropDownChange = (event) => {
    const {
      input: { name },
      _dropDownChange,
    } = this.props;
    _dropDownChange({ name, value: event.target.value });
  };

  render() {
    const {
      input, type = 'text', meta, _dropDownChange = null, ...rest
    } = this.props;
    return (
      <>
        {type === 'dropdown' ? (
          <select className="form-control" {...rest} {...input} {...(_dropDownChange ? { onChange: this._dropDownChange } : {})}>
            {rest.placeholder && <option value="">{rest.placeholder}</option>}
            {rest.data.map((value, key) => (
              <option key={`reduxDropdown${key}`} value={key}>{value}</option>
            ))}
          </select>
        ) : null}

        {['text', 'number', 'password', 'checkbox', 'radio', 'hidden'].includes(type) ? (
          <input {...rest} {...input} type={type} />
        ) : type === 'textarea' ? (
          <textarea {...rest} {...input} />
        ) : null}

        {meta.touched && meta.error && (
          <span className="text-danger small">
            <i className="fa fa-exclamation-circle text-danger" />
            &nbsp;&nbsp;
            {meta.error}
          </span>
        )}
      </>
    );
  }
}

export const renderField = (props) => <ReduxField {...props} />;

const Components = ({ element, handleChange }) => {

  console.log(element);

  switch (element.type) {
    case 'edittext':
    case 'decimal':
        if (element.displayElement === true) {
          return <Field
            component={renderField}
            type="text"
            name={`question_${element.que_id}`}
            id={`question${element.que_id}`}
            className="form-control"
            placeholder="Enter here"
          />;
        }
        break;
    case 'spinner':
        const options = element.value.split('#');
        const newOptions = options.map((option, index) => ({
          id: index+1,
          label: option,
          value: option
        }));
        return <Field
          type="dropdown"
          name={`question_${element.que_id}`}
          placeholder="-- select one --"
          id={`question${element.que_id}`}
          className="form-control"
          component={renderSelect}
          options={newOptions}
          onChange={(e) => handleChange(element, e)}
        />;
    case 'image':
        return <input type="file" />;
    default:
        return null;
  }
}

export default Components;
