const axios = require('axios');


const minifyBrandData = function(b) {
    return {
        _id: b._id,
        categories_hierarchy: b.categories_hierarchy,
        product_name: b.product_name || b.product_name_en || b.product_name_es || b.product_name_it
    };
}


const findFood = async function(brand, allergen_id) {
    console.log(`Brand: ${brand}, and Allergen ID: ${allergen_id}`);


    let brands = brand.split(" ");

    // let urlParams = brands.map((b, idx) => {
    //     return `tagtype_${idx}=brands&tag_contains_${idx}=contains&tag_${idx}=${b}`
    // }).join("&");

    let urlParams = brands.slice(0, 3).join("%20");
    console.log(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=Twix%20caramel%20cookie&search_simple=1&json=1`);

    //console.log(`https://us.openfoodfacts.org/cgi/search.pl?action=process&${urlParams}&json=true`);

    return axios.get(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${urlParams}&search_simple=1&json=1`)
        .then(function (response) {
            // handle success
            console.log(JSON.stringify(response.data));

            if (response.data.count > 0) {

                const brandData = response.data.products[0];
                console.log(JSON.stringify(brandData));


                let contains = 'false';
                if (brandData.allergens_hierarchy.filter((ah) => ah === allergen_id).length > 0) {
                    contains = 'true';
                }

                return {
                    brandData: minifyBrandData(brandData),
                    contains
                };
            }
        });
}


const findSimilar = async function(brand, brandData, allergen_id) {

    if (!brandData) {
        const result = await findFood(brand, allergen_id);
        brandData = result.brandData;
    }


    // Get first two categories
    let urlParams = brandData.categories_hierarchy.slice(0, 2).map((c, idx) => {
        return `tagtype_${idx}=categories&tag_contains_${idx}=contains&tag_${idx}=${c}`
    }).join("&");

    urlParams += `&tagtype_2=allergens&tag_contains_2=does_not_contain&tag_2=${allergen_id}`;

    console.log(`https://us.openfoodfacts.org/cgi/search.pl?action=process&${urlParams}&json=true`);

    return axios.get(`https://us.openfoodfacts.org/cgi/search.pl?action=process&${urlParams}&json=true`)
        .then(function (response) {
            // handle success
            console.log(JSON.stringify(response.data));

            const recommendBrand = response.data.products[0];

            return minifyBrandData(recommendBrand);

        });
}


module.exports = {
    findFood,
    findSimilar
};
