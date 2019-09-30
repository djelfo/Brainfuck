const bf = {
  boilerplate: {
    helloWorld: '++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.'
  },
  debug: (raw) => {

    let stack = {
      cells: [],
      pointer: 0
    }

    let parsingPosition = 0;
    let input = (raw) ? raw.replace(/\{.*\}/, '').replace(/[^<>\[\]+-.,]/g, '') : null;
    let output = '';
    let errors = [];
    let delta = 0;

    Array.from(input).forEach(elem => {
      if (elem == '[') delta += 1;
      else if (elem == ']') delta -= 1;
    });

    if (delta != 0) {
      errors.push('Brackets not maching');
    }

    return errors;

  },
  parse: (raw) => {

    let stack = {
      cells: [],
      pointer: 0
    }

    /* /[^<>\[\]+-.*,]/g */

    let parsingPosition = 0;
    let input = (raw) ? raw : null;
    let output = '';
    let iterationCount = 0;
    let errors = [];
    let maxIteration = 10000000;

    let numeric = (val) => /^[0-9]+$/.test(val);

    if (input == null) errors.push('No input provided to parser');
    else errors = bf.debug(input);

    while (errors.length == 0 && parsingPosition < input.length && iterationCount < maxIteration) {

      if (input[parsingPosition] == '>') stack.pointer += 1;
      else if (input[parsingPosition] == '<') stack.pointer -= 1;
      else if ('+-'.includes(input[parsingPosition])) {
        if (!stack.cells[stack.pointer]) stack.cells[stack.pointer] = 0;
        stack.cells[stack.pointer] += (input[parsingPosition] == '+') ? 1 : -1;
      } else if (input[parsingPosition] == '[' && (stack.cells[stack.pointer] == 0 || stack.cells[stack.pointer] == undefined)) {
        let delta = 1;
        while (delta != 0) {
          parsingPosition += 1;
          if (input[parsingPosition] == '[') delta += 1;
          else if (input[parsingPosition] == ']') delta -= 1;
        }
      } else if (input[parsingPosition] == ']' && (stack.cells[stack.pointer] != 0 || stack.cells[stack.pointer] != undefined)) {
        let delta = -1;
        while (delta != 0) {
          parsingPosition -= 1;
          if (input[parsingPosition] == '[') delta += 1;
          else if (input[parsingPosition] == ']') delta -= 1;
        }
        parsingPosition -= 1;
      } else if (input[parsingPosition] == '.') output += String.fromCharCode(stack.cells[stack.pointer]);
      else if (input[parsingPosition] == '*') {
        if (!stack.cells[stack.pointer]) stack.cells[stack.pointer] = 0;
        output += stack.cells[stack.pointer];
      } else if (input[parsingPosition] == ',' && input[parsingPosition + 1] == '{') {
        parsingPosition += 2;
        if (numeric(input[parsingPosition])) {
          let substr = '';
          while (input[parsingPosition] != '}') {
            if (numeric(input[parsingPosition])) substr += input[parsingPosition];
            parsingPosition += 1;
          }
          if (substr != '') stack.cells[stack.pointer] = Number(substr);
        } else {
          stack.cells[stack.pointer] = input[parsingPosition].charCodeAt(0);
          while (input[parsingPosition] != '}') parsingPosition += 1;
        }
      }

      parsingPosition += 1;
      iterationCount += 1;

    }

    if (iterationCount >= maxIteration) errors.push('Max iterations reached');

    return (errors.length == 0) ? {
      output,
      stack
    } : {
      errors
    };

  },
};

module.exports = bf;
