import type { Recipe } from "@/types/recipe";

// Simplified core-ingredient recipes, not cooking instructions or serving sizes.
// Water and cooking oil are assumed kitchen basics; neither appears on the plate.
const bread = ["white-bread", "wholemeal-bread"];
const pasta = ["pasta-500g", "spaghetti-500g"];
const rice = ["rice-1kg", "basmati-rice-1kg", "brown-rice-1kg"];
const noodles = ["instant-noodles", "pot-noodle"];
const eggs = ["eggs-dozen", "eggs-six"];
const milk = ["milk-2l", "milk-1l", "long-life-milk"];
const chicken = ["chicken-thighs", "chicken-breast-500g"];
const fish = ["tinned-tuna", "tinned-sardines", "white-fish-fillets-500g"];
const beans = ["chickpeas-tin", "kidney-beans-tin", "dried-lentils"];
const mince = ["beef-mince", "pork-mince-500g"];
const tomato = ["tinned-tomatoes", "pasta-sauce", "tomato-paste"];
const veg = ["carrots", "broccoli", "frozen-mixed-veg", "tinned-corn", "onions", "red-onions-500g"];
const salad = ["bagged-salad", "carrots", "tinned-corn", "red-onions-500g"];
const fruit = ["bananas", "bag-of-apples", "frozen-berries", "tinned-peaches", "fruit-salad-pot", "orange-net"];
const aromatics = ["onions", "red-onions-500g", "garlic-bulb", "fresh-basil", "dried-oregano", "ground-cumin"];
const cheese = ["cheese-block"];

export const MEAL_RECIPES: Recipe[] = [
  { id: "chicken-veg-rice", name: "Chicken and vegetable rice", ingredients: [rice, chicken, veg] },
  { id: "tofu-veg-rice", name: "Tofu and vegetable rice", ingredients: [rice, ["tofu"], veg] },
  { id: "egg-veg-rice", name: "Vegetable egg fried rice", ingredients: [rice, eggs, veg] },
  { id: "fish-veg-rice", name: "Fish and vegetable rice", ingredients: [rice, fish, veg] },
  { id: "mince-veg-rice", name: "Mince and vegetable rice", ingredients: [rice, mince, veg] },
  { id: "chickpea-rice-salad", name: "Chickpea rice salad", ingredients: [rice, ["chickpeas-tin"], salad] },
  { id: "lentil-rice-veg", name: "Lentil and vegetable pilaf", ingredients: [rice, ["dried-lentils"], veg] },
  { id: "bean-corn-rice", name: "Rice, beans and sweetcorn", ingredients: [rice, ["kidney-beans-tin", "baked-beans"], ["tinned-corn"]] },
  { id: "tuna-corn-pasta", name: "Tuna and sweetcorn pasta", ingredients: [pasta, ["tinned-tuna"], ["tinned-corn"]] },
  { id: "chicken-veg-pasta", name: "Chicken and vegetable pasta", ingredients: [pasta, chicken, veg] },
  { id: "cheese-broccoli-pasta", name: "Cheesy broccoli pasta", ingredients: [pasta, cheese, ["broccoli"]] },
  { id: "sardine-tomato-pasta", name: "Sardine and tomato pasta", ingredients: [pasta, ["tinned-sardines"], ["tinned-tomatoes"]] },
  { id: "lentil-tomato-pasta", name: "Lentil bolognese", ingredients: [pasta, ["dried-lentils"], ["tinned-tomatoes"]] },
  { id: "chickpea-veg-pasta", name: "Chickpea and vegetable pasta", ingredients: [pasta, ["chickpeas-tin"], veg] },
  { id: "tofu-veg-noodles", name: "Tofu and vegetable noodles", ingredients: [noodles, ["tofu"], veg] },
  { id: "chicken-veg-noodles", name: "Chicken and vegetable noodles", ingredients: [noodles, chicken, veg] },
  { id: "egg-veg-noodles", name: "Egg and vegetable noodles", ingredients: [noodles, eggs, veg] },
  { id: "peanut-veg-noodles", name: "Peanut and vegetable noodles", ingredients: [noodles, ["peanut-butter", "salted-peanuts"], veg] },
  { id: "tuna-salad-sandwich", name: "Tuna salad sandwich", ingredients: [bread, ["tinned-tuna"], salad] },
  { id: "chicken-salad-sandwich", name: "Chicken salad sandwich", ingredients: [bread, chicken, salad] },
  { id: "egg-salad-sandwich", name: "Egg salad sandwich", ingredients: [bread, eggs, salad] },
  { id: "cheese-salad-sandwich", name: "Cheese salad sandwich", ingredients: [bread, cheese, salad] },
  { id: "chickpea-salad-sandwich", name: "Chickpea salad sandwich", ingredients: [bread, ["chickpeas-tin"], salad] },
  { id: "fish-salad-sandwich", name: "Fish finger salad sandwich", ingredients: [bread, ["fish-fingers"], salad] },
  { id: "bean-corn-potato", name: "Jacket potato with beans and corn", ingredients: [["potatoes-2kg"], ["baked-beans", "kidney-beans-tin"], ["tinned-corn"]] },
  { id: "tuna-salad-potato", name: "Tuna jacket potato with salad", ingredients: [["potatoes-2kg"], ["tinned-tuna"], salad] },
  { id: "chicken-potato-veg", name: "Chicken and vegetable tray bake", ingredients: [["potatoes-2kg"], chicken, veg] },
  { id: "fish-potato-veg", name: "Fish, wedges and vegetables", ingredients: [["potatoes-2kg"], ["white-fish-fillets-500g", "fish-fingers"], veg] },
  { id: "fruit-yoghurt-oats", name: "Fruit and yoghurt overnight oats", ingredients: [["oats"], ["yoghurt-tub"], fruit] },
  { id: "banana-peanut-porridge", name: "Banana and peanut butter porridge", ingredients: [["oats"], ["peanut-butter"], ["bananas"]] },
];

export const RECIPES: Recipe[] = [
  ...MEAL_RECIPES,
  { id: "tomato-beans", name: "Tomato and bean stew", ingredients: [[...beans, "baked-beans"], tomato], optional: [...aromatics, "carrots", "ground-cumin"] },
  { id: "bean-pasta", name: "Bean pasta", ingredients: [pasta, [...beans, "baked-beans"]], optional: [...tomato, ...aromatics] },
  { id: "bean-vegetable-soup", name: "Bean and vegetable soup", ingredients: [[...beans, "baked-beans"], veg], optional: [...veg, ...tomato, ...aromatics] },
  { id: "sardine-crackers", name: "Sardine crackers", ingredients: [["crackers", "rice-cakes"], ["tinned-sardines"]], optional: ["lemons-three"] },
  { id: "tuna-crackers", name: "Tuna crackers", ingredients: [["crackers", "rice-cakes"], ["tinned-tuna"]], optional: ["tinned-corn", "lemons-three"] },
  { id: "peanut-noodles", name: "Peanut noodles", ingredients: [noodles, ["peanut-butter", "salted-peanuts"]], optional: [...veg, "garlic-bulb"] },
  { id: "bean-flatbreads", name: "Bean-stuffed flatbreads", ingredients: [["plain-flour-1kg"], ["chickpeas-tin", "kidney-beans-tin", "dried-lentils"]], optional: ["ground-cumin", "onions", "garlic-bulb"] },
  { id: "potato-veg", name: "Roast vegetable tray bake", ingredients: [["potatoes-2kg"], ["carrots", "onions", "red-onions-500g", "broccoli"]], optional: [...veg, ...aromatics] },

  { id: "bolognese", name: "Spaghetti bolognese", ingredients: [pasta, mince, tomato], optional: aromatics },
  { id: "lasagne", name: "Lasagne", ingredients: [["lasagne-sheets"], mince, tomato, cheese], optional: [...aromatics, ...milk] },
  { id: "bean-chilli", name: "Bean chilli with rice", ingredients: [rice, ["kidney-beans-tin"], tomato], optional: ["ground-cumin", "curry-powder", ...aromatics] },
  { id: "pancakes", name: "Pancakes", ingredients: [["plain-flour-1kg"], eggs, milk], optional: ["caster-sugar-1kg", "butter", "bananas", "frozen-berries", "lemons-three"] },
  { id: "french-toast", name: "French toast", ingredients: [bread, eggs, milk], optional: ["caster-sugar-1kg", "butter", "bananas", "frozen-berries"] },
  { id: "rice-pudding", name: "Rice pudding", ingredients: [rice, milk, ["caster-sugar-1kg"]], optional: ["tinned-peaches", "frozen-berries"] },
  { id: "peanut-banana-toast", name: "Banana and peanut butter toast", ingredients: [bread, ["peanut-butter"], ["bananas"]] },
  { id: "tomato-pasta", name: "Tomato pasta", ingredients: [pasta, tomato], optional: [...aromatics, "cheese-block", "tomato-paste"] },
  { id: "cheesy-pasta", name: "Cheesy pasta", ingredients: [pasta, cheese], optional: [...milk, "butter", "broccoli"] },
  { id: "tuna-pasta", name: "Tuna pasta", ingredients: [pasta, ["tinned-tuna"]], optional: [...tomato, "tinned-corn", ...aromatics, "lemons-three"] },
  { id: "sardine-pasta", name: "Sardine pasta", ingredients: [pasta, ["tinned-sardines"]], optional: [...tomato, ...aromatics, "lemons-three"] },
  { id: "chicken-pasta", name: "Chicken pasta", ingredients: [pasta, chicken], optional: [...tomato, ...veg, ...aromatics] },
  { id: "vegetable-pasta", name: "Vegetable pasta", ingredients: [pasta, veg], optional: [...tomato, ...aromatics, "cheese-block"] },
  { id: "garlic-pasta", name: "Garlic pasta", ingredients: [pasta, ["garlic-bulb"]], optional: ["fresh-basil", "dried-oregano", "lemons-three"] },
  { id: "bacon-pasta", name: "Bacon pasta", ingredients: [pasta, ["bacon"]], optional: [...tomato, ...aromatics, "cheese-block"] },
  { id: "beans-on-toast", name: "Beans on toast", ingredients: [bread, ["baked-beans"]], optional: ["cheese-block", ...eggs] },
  { id: "egg-toast", name: "Eggs on toast", ingredients: [bread, eggs], optional: ["butter", "bacon", "bagged-salad"] },
  { id: "cheese-toastie", name: "Cheese toastie", ingredients: [bread, cheese], optional: ["butter", "onions", "red-onions-500g"] },
  { id: "peanut-toast", name: "Peanut butter toast", ingredients: [bread, ["peanut-butter"]] },
  { id: "tuna-sandwich", name: "Tuna sandwich", ingredients: [bread, ["tinned-tuna"]], optional: ["bagged-salad", "tinned-corn", "red-onions-500g"] },
  { id: "chicken-sandwich", name: "Chicken sandwich", ingredients: [bread, chicken], optional: ["bagged-salad", "cheese-block", "carrots"] },
  { id: "fish-finger-sandwich", name: "Fish finger sandwich", ingredients: [bread, ["fish-fingers"]], optional: ["bagged-salad", "lemons-three"] },
  { id: "sausage-sandwich", name: "Sausage sandwich", ingredients: [bread, ["sausages"]], optional: ["onions", "red-onions-500g"] },
  { id: "bacon-sandwich", name: "Bacon sandwich", ingredients: [bread, ["bacon"]], optional: ["bagged-salad", ...eggs] },
  { id: "sardines-toast", name: "Sardines on toast", ingredients: [bread, ["tinned-sardines"]], optional: ["lemons-three", "red-onions-500g"] },
  { id: "chickpea-sandwich", name: "Smashed chickpea sandwich", ingredients: [bread, ["chickpeas-tin"]], optional: ["bagged-salad", "carrots", "lemons-three"] },
  { id: "salad-sandwich", name: "Salad sandwich", ingredients: [bread, salad], optional: ["cheese-block", "bagged-salad", "carrots", "tinned-corn"] },
  { id: "egg-fried-rice", name: "Egg fried rice", ingredients: [rice, eggs], optional: [...veg, "garlic-bulb"] },
  { id: "vegetable-rice", name: "Vegetable rice", ingredients: [rice, veg], optional: ["ground-cumin", "garlic-bulb"] },
  { id: "chicken-rice", name: "Chicken rice bowl", ingredients: [rice, chicken], optional: [...veg, ...aromatics] },
  { id: "tofu-rice", name: "Tofu rice bowl", ingredients: [rice, ["tofu"]], optional: [...veg, "garlic-bulb"] },
  { id: "beans-rice", name: "Rice and beans", ingredients: [rice, [...beans, "baked-beans"]], optional: [...tomato, ...aromatics, "tinned-corn"] },
  { id: "fish-rice", name: "Fish and rice", ingredients: [rice, fish], optional: ["lemons-three", "tinned-corn", "broccoli", "garlic-bulb"] },
  { id: "mince-rice", name: "Mince rice bowl", ingredients: [rice, mince], optional: [...veg, ...aromatics] },
  { id: "egg-noodles", name: "Noodles with egg", ingredients: [noodles, eggs], optional: [...veg, "garlic-bulb"] },
  { id: "tofu-noodles", name: "Tofu noodles", ingredients: [noodles, ["tofu"]], optional: [...veg, "garlic-bulb"] },
  { id: "chicken-noodles", name: "Chicken noodles", ingredients: [noodles, chicken], optional: [...veg, "garlic-bulb"] },
  { id: "vegetable-noodles", name: "Vegetable noodles", ingredients: [noodles, veg], optional: ["garlic-bulb", "salted-peanuts"] },
  { id: "mince-noodles", name: "Mince noodles", ingredients: [noodles, mince], optional: [...veg, "garlic-bulb"] },
  { id: "tuna-noodles", name: "Tuna noodles", ingredients: [noodles, ["tinned-tuna"]], optional: ["tinned-corn", "broccoli", "lemons-three"] },
  { id: "baked-potato-beans", name: "Jacket potato with beans", ingredients: [["potatoes-2kg"], ["baked-beans"]], optional: ["cheese-block", "butter"] },
  { id: "baked-potato-cheese", name: "Cheesy jacket potato", ingredients: [["potatoes-2kg"], cheese], optional: ["butter", "bagged-salad"] },
  { id: "baked-potato-tuna", name: "Tuna jacket potato", ingredients: [["potatoes-2kg"], ["tinned-tuna"]], optional: ["tinned-corn", "cheese-block", "bagged-salad"] },
  { id: "potato-omelette", name: "Potato omelette", ingredients: [["potatoes-2kg"], eggs], optional: ["onions", "red-onions-500g", "cheese-block"] },
  { id: "bangers-mash", name: "Sausages and mash", ingredients: [["potatoes-2kg"], ["sausages"]], optional: [...milk, "butter", "onions"] },
  { id: "fish-potatoes", name: "Fish and potato wedges", ingredients: [["potatoes-2kg"], ["white-fish-fillets-500g", "fish-fingers"]], optional: ["lemons-three", "bagged-salad"] },
  { id: "roast-chicken-veg", name: "Chicken with roast vegetables", ingredients: [chicken, ["potatoes-2kg", "carrots", "onions", "red-onions-500g", "broccoli"]], optional: [...veg, "potatoes-2kg", "garlic-bulb", "dried-oregano", "lemons-three"] },
  { id: "tofu-stirfry", name: "Tofu and vegetable stir-fry", ingredients: [["tofu"], veg], optional: ["garlic-bulb", "salted-peanuts"] },
  { id: "vegetable-omelette", name: "Vegetable omelette", ingredients: [eggs, veg], optional: ["cheese-block", "fresh-basil"] },
  { id: "cheese-omelette", name: "Cheese omelette", ingredients: [eggs, cheese], optional: [...veg, "fresh-basil"] },
  { id: "chickpea-salad", name: "Chickpea salad", ingredients: [["chickpeas-tin"], salad], optional: [...salad, "lemons-three", "fresh-basil"] },
  { id: "kidney-bean-salad", name: "Kidney bean salad", ingredients: [["kidney-beans-tin"], salad], optional: [...salad, "lemons-three"] },
  { id: "tuna-salad", name: "Tuna salad", ingredients: [["tinned-tuna"], salad], optional: [...salad, ...eggs, "lemons-three"] },
  { id: "lentil-soup", name: "Lentil and vegetable soup", ingredients: [["dried-lentils"], [...veg, "tinned-tomatoes"]], optional: [...veg, "tinned-tomatoes", "ground-cumin", "garlic-bulb"] },
  { id: "tomato-soup", name: "Tomato soup", ingredients: [["tinned-tomatoes"], ["onions", "red-onions-500g"]], optional: ["fresh-basil", "garlic-bulb", "tomato-paste"] },
  { id: "lemon-fish", name: "Lemon fish", ingredients: [["white-fish-fillets-500g"], ["lemons-three"]], optional: ["garlic-bulb", "dried-oregano"] },
  { id: "chickpea-curry", name: "Chickpea curry", ingredients: [["chickpeas-tin"], ["curry-powder"], tomato], optional: [...aromatics, "potatoes-2kg"] },
  { id: "yoghurt-flatbread", name: "Yoghurt flatbread", ingredients: [["plain-flour-1kg"], ["yoghurt-tub"]], optional: ["garlic-bulb", "dried-oregano"] },
  { id: "fruit-porridge", name: "Fruit porridge", ingredients: [["oats"], fruit], optional: [...milk, "caster-sugar-1kg"] },
  { id: "milky-porridge", name: "Creamy porridge", ingredients: [["oats"], milk], optional: ["caster-sugar-1kg"] },
  { id: "peanut-porridge", name: "Peanut butter porridge", ingredients: [["oats"], ["peanut-butter"]], optional: [...milk, "bananas"] },
  { id: "fruit-yoghurt", name: "Fruit and yoghurt bowl", ingredients: [["yoghurt-tub"], fruit], optional: ["oats", "budget-cereal"] },
  { id: "cereal-milk", name: "Cereal with milk", ingredients: [["budget-cereal"], milk], optional: ["bananas", "frozen-berries"] },
  { id: "yoghurt-cereal", name: "Crunchy yoghurt bowl", ingredients: [["budget-cereal"], ["yoghurt-tub"]], optional: fruit },
  { id: "fruit-salad", name: "Fresh fruit salad", ingredients: [["bananas", "bag-of-apples", "orange-net"], ["bananas", "bag-of-apples", "orange-net", "frozen-berries", "tinned-peaches"]], optional: fruit },
  { id: "apple-peanut", name: "Apple with peanut butter", ingredients: [["bag-of-apples"], ["peanut-butter"]] },
  { id: "banana-peanut", name: "Banana with peanut butter", ingredients: [["bananas"], ["peanut-butter"]] },
  { id: "cheese-crackers", name: "Cheese and crackers", ingredients: [["crackers", "rice-cakes"], cheese], optional: ["bag-of-apples", "carrots"] },
  { id: "peanut-crackers", name: "Peanut butter crackers", ingredients: [["crackers", "rice-cakes"], ["peanut-butter"]], optional: ["bananas"] },
  { id: "hummus-dip", name: "Hummus with carrot sticks", ingredients: [["chickpeas-tin"], ["lemons-three"], ["carrots"]], optional: ["garlic-bulb", "ground-cumin"] },
];

/** Core cooking ingredients, excluding ready meals, treats and packaged snacks. */
export const STAPLE_IDS = new Set([
  ...bread, ...pasta, ...rice, ...eggs, ...milk, ...chicken, ...fish, ...beans, ...mince,
  ...veg, ...fruit, ...tomato, ...aromatics, "cheese-block", "yoghurt-tub", "butter",
  "tofu", "baked-beans", "bagged-salad", "potatoes-2kg", "oats", "peanut-butter",
  "lasagne-sheets", "plain-flour-1kg", "caster-sugar-1kg", "curry-powder", "lemons-three", "tomato-paste",
]);
