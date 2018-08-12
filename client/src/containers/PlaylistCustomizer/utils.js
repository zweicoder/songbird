// Converts every first character of words in a string to capital
export function capitalCase(str) {
  const splitted = str.split(' ');
  return splitted.map(e=> e.charAt(0).toUpperCase() + e.substr(1)).join(' ');
}
