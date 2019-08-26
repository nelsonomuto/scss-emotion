const glob = require('glob');
const fs = require('fs');
// glob('../extension-save-to-pocket/src/**/**/toolbar.scss', function(
//   err,
//   files
// ) {
  glob('../extension-save-to-pocket/src/**/**/*.scss', function(err, files) {
  files.forEach(file => {
    let contents = fs.readFileSync(file).toString();
    contents = contents.replace(/\$[a-z\-]*/ig, match => {
      let val = snakeToCamel(match);
      return `\${${val}}`;
    });
    contents = contents.replace(/\@include pocketButton\;/ig, match => {
      return '${mixin_pocketButton}';
    });
    contents = contents.replace(/@import(.*);/g, (match, importPath) => {
      importPath = importPath.replace('_styles', 'styles');
      let importVar = ''
      let additionalVars = '';
      if (importPath.match(/colors/)) {
        importVar = 'COLORS';
        const colorMatches =  contents.match(/\$[a-z\-]*/ig)
        const colors = colorMatches && colorMatches.reduce((sum, curr, index) => {
          if(curr === '$') return sum
          sum += curr
          if(colorMatches.length - 1 === index) {
            return sum
          }
          if(curr === '$fontstackDefault') {
            return sum;
          }
          if(sum.search(curr) === 1) {
            return sum
          }
          return sum + ', '
        }, '')
        additionalVars = `\nconst { ${colors || ''} } = COLORS`;
      } else if (importPath.match(/variables/)) {
        importVar = 'TYPOGRAPHY';
        additionalVars = `\nconst { $fontstackDefault } = TYPOGRAPHY`;
      } else if (importPath.match(/components/)) {
        importVar = 'mixin_pocketButton';
        additionalVars = `\n`;
      }
      return `import {${importVar}} from ${importPath};${additionalVars}`;
    });

    contents = `import styled from '@emotion/styled'\n${contents}`
    console.log(contents);
    fs.writeFileSync(file + '.style-debug', contents);
  });
});
function snakeToCamel(s) {
  return s.replace(/(\-\w)/g, function(m) {
    return m[1].toUpperCase();
  });
}
