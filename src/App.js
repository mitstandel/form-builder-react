import { reduxForm } from 'redux-form';
import './App.css';
import Components from './Components';
import formData from './data/form-data.json';
import { useState } from 'react';

function App() {
  const [ formElements, setFormElements ] = useState(formData.data.questions.map((question) => {
    question.displayElement = question.dependency_flag !== "1";
    return question;
  }));

  const handleChange = (element, event) => {
    const conditions = element.condition_123.split(' delimit ');
    conditions.forEach((condition) => {
      const options = condition.split('#');
      if (options[1] === event.value) {
        const updatedElements = formElements.map(que => {
          if (que.dependency_flag === "1") {
            const booleanDisplay = (que.que_id === Number(options[0]) ? true : false); console.log(booleanDisplay);
            return { ...que, displayElement: booleanDisplay};
          }
          return que;
        });
        setFormElements(updatedElements);
      }
    });
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <form form="testForm" className="">
          { formElements.map((element) => (
            <div className="form-group" key={`element-${element.que_id}`}>
              {(element.displayElement === true) && <label className="control-label">{element.question}</label>}
              <Components element={element} handleChange={handleChange} />
            </div>
          ))}
        </form>
      </header>
    </div>
  );
}

const withForm = reduxForm({
  enableReinitialize: true,
  form: 'testForm',
});

export default withForm(App);
