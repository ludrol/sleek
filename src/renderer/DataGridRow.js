import React, { useState } from 'react';
import { Chip, Checkbox, ListItem, Divider } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import theme from './Theme';
import TodoDialog from './TodoDialog';
import './DataGridRow.scss';

const DataGridRow = ({ rowData }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const openAddTodoDialog = () => {
    setDialogOpen(true);
  };

  const handleCheckboxChange = (event) => {
    window.electron.ipcRenderer.send('changeCompleteState', rowData.id, event.target.checked);
  };

  if (rowData.group) {
    if (!rowData.body) return <Divider />;
    return <ListItem className="row group"><Chip data-body={rowData.body} label={rowData.body} /></ListItem>;
  }

  const words = rowData.body.split(' ');

  const isExpression = (word, pattern) => pattern.test(word);

  const expressions = [
    { pattern: /^@\S+$/, value: '@' },
    { pattern: /^\+\S+$/, value: '+' },
    { pattern: /\bdue:\d{4}-\d{2}-\d{2}\b/, value: 'due:' },
    { pattern: /\bt:\d{4}-\d{2}-\d{2}\b/, value: 't:' },
    { pattern: /^rec:\d*[dwmy]$/, value: 'rec:' },
    { pattern: /\bh:1\b/, value: 'h:1' },
    { pattern: /^#\S+$/, value: '#' },
    { pattern: /pm:\d+\b/, value: 'pm:' },
  ];

  const handleDivClick = (event) => {
    if (!event.target.matches('input[type="checkbox"]') && !event.target.matches('span.MuiChip-label')) {
      openAddTodoDialog();
    }
  };

  const handleButtonClick = (word, value) => {
    // console.log(value);
  };

  return (
    <ThemeProvider theme={theme}>
      {dialogOpen && <TodoDialog todoTxtObject={rowData} setDialogOpen={setDialogOpen} />}
      <ListItem className="row" data-complete={rowData.complete} data-priority={rowData.priority} onClick={handleDivClick}>
        <Checkbox checked={rowData.complete} onChange={handleCheckboxChange} />
        {words.map((word, index) => {
          const expression = expressions.find((expr) => isExpression(word, expr.pattern));
          if (expression && expression.value !== 'due:' && expression.value !== 't:') {
            return (
              <Chip
                variant="contained"
                size="small"
                key={index} // Unique key prop
                onClick={() => handleButtonClick(word, expression.value)}
                data-type="filter"
                data-todotxt-attribute={expression.value}
                label={word}
              />
            );
          } else if (expression && (expression.value === 'due:' || expression.value === 't:')) {
            return (
              <Chip
                key={index}
                avatar={<FontAwesomeIcon data-testid='fa-icon-clock' icon={faClock} />}
                onClick={() => handleButtonClick(word, expression.value)}
                label={word}
                variant="contained"
              />
            );
          } else {
            return <React.Fragment key={index}>{word}&nbsp;</React.Fragment>;
          }
        })}
      </ListItem>
    </ThemeProvider>
  );
};

export { DataGridRow };
