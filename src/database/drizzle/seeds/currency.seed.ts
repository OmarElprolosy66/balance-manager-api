import 'dotenv/config';
import currencyCodes from 'currency-codes';
import getSymbolFromCurrency from 'currency-symbol-map';

import { db } from '../db';
import { currenciesTable } from '../schema';

export async function seedCurrencies() {
    const currencies = currencyCodes.data.map((currency) => ({
        code: currency.code,
        name: currency.currency,
        symbol: getSymbolFromCurrency(currency.code) ?? currency.code,
        decimalPlaces: currency.digits,
    }));

    await db.insert(currenciesTable).values(currencies).onConflictDoNothing();
}

// TODO: refactor main to main seeder file when we have more seeds
function main() {
    seedCurrencies()
        .then(() => {
            console.log('Currencies seeded successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Error seeding currencies:', error);
            process.exit(1);
        });
}
main();
/////////////////////////////////////////////////////////////////
