const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('Unit Test: i18n Localization Dictionaries (public/js/i18n.js)', () => {
    // Read the file and evaluate the translations object
    const filePath = path.join(__dirname, '../../public/js/i18n.js');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract the translations object code
    const match = content.match(/export\s+const\s+translations\s*=\s*(\{[\s\S]*?\n\};)/);
    assert.ok(match, 'translations object must be present in i18n.js');
    
    const translationsCode = '(' + match[1].replace(/;$/, '') + ')';
    const translations = eval(translationsCode);

    test('Both English (en) and Korean (ko) dictionaries must exist', () => {
        assert.ok(translations.en, 'English dictionary must exist');
        assert.ok(translations.ko, 'Korean dictionary must exist');
    });

    test('All English translation keys must also exist in Korean dictionary (Key parity)', () => {
        const enKeys = Object.keys(translations.en);
        const koKeys = Object.keys(translations.ko);

        const missingInKo = enKeys.filter(key => !(key in translations.ko));
        assert.deepStrictEqual(missingInKo, [], `Keys missing in Korean dictionary: ${missingInKo.join(', ')}`);

        const missingInEn = koKeys.filter(key => !(key in translations.en));
        assert.deepStrictEqual(missingInEn, [], `Keys missing in English dictionary: ${missingInEn.join(', ')}`);
    });

    test('Critical brand and UX translation keys must not be empty in both languages', () => {
        const criticalKeys = [
            'docTitle',
            'brandVisionTitle',
            'tabSignUp',
            'tabLogIn',
            'btnCreateAccount',
            'btnLogIn',
            'btnAiCompare',
            'bestDealBadge'
        ];

        criticalKeys.forEach(key => {
            assert.ok(translations.en[key] && translations.en[key].length > 0, `English key '${key}' should not be empty`);
            assert.ok(translations.ko[key] && translations.ko[key].length > 0, `Korean key '${key}' should not be empty`);
        });
    });
});
