/**
 * Capitalize the first letter of the string.
 * @returns {string} The capitalized string.
 */
String.prototype.capitalizeWord = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase()
}

/**
 * Capitalize the first letter of each word in the string.
 * @returns {string} The string with each word capitalized.
 */
String.prototype.capitalizeWords = function() {
    return this.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};
