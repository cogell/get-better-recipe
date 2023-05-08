import * as dotenv from 'dotenv';
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import * as cherrio from 'cheerio';

dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const model = new OpenAI({
  openAIApiKey: OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  temperature: 0,
  maxTokens: -1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  topP: 1.0,
});

// const template = `Extract the ingredients and instructions from HTML recipe below, output as json with keys lowercase keys instructions and ingredients. For ingredients extract quantity if available.

//   {recipeBody}
//   `;

const getIngredients = new LLMChain({
  llm: model,
  prompt: new PromptTemplate({
    template: `Extract the ingredients from the text recipe below.

    {recipeBody}
    `,
    inputVariables: ['recipeBody'],
  }),
});

const getIngredients2 = new LLMChain({
  llm: model,
  prompt: new PromptTemplate({
    template: `Extract the ingredients from the text recipe below.

    {recipeBody}
    `,
    inputVariables: ['recipeBody'],
  }),
});

const transformTextToJSONChain = new LLMChain({
  llm: model,
  prompt: new PromptTemplate({
    template: `Transform the text below into JSON, with keys lowercase keys "instructions" and "ingredients".

    {recipe}
    `,
    inputVariables: ['recipe'],
  }),
});

// const recipeUrl = 'https://www.loveandlemons.com/brownies-recipe/';
const recipeUrl =
  'https://www.seriouseats.com/pork-and-leek-dumplings-with-homemade-wrapper';

const getRecipeHTML = async (recipeUrl: string) => {
  const res = await fetch(recipeUrl);
  const html = await res.text();
  return html;
};

const getRecipeBody = (html: string) => {
  const $ = cherrio.load(html);
  const body = $('body');
  // remove all script tags
  body.find('script').remove();
  // remove all img tags
  body.find('img').remove();
  // remove all style tags
  body.find('style').remove();
  // remove all noscript tags
  body.find('noscript').remove();
  // remove all instances of multiple newlines
  const bodyText = body.text();
  const bodyReduced = bodyText.replace(/\n{2,}/g, '\n');

  return bodyReduced;
};

const handleAxiosError = (error: any) => {
  if (error.response) {
    // Request made and server responded
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    console.log(error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log('Error', error.message);
  }
  // console.log(error.config);
};

const highlightedText = `Ingredients
Save Recipe
For the Dough:

2 cups (9 ounces; 255g) all-purpose flour
1 cup (237ml) boiling water
For the Filling:

1/2 pound (8 ounces; 226g) Napa cabbage (about 1/2 a small head), roughly chopped
1 teaspoon (3g) kosher salt; for table salt, use half as much by volume
2 scallions, roughly chopped
1/2 pound (8 ounces; 226g) fatty ground pork
2 teaspoons soy sauce
1 tablespoon Shaoxing wine
2 teaspoons sugar
For the Dipping Sauce:

2 tablespoons soy sauce
2 tablespoons Chinkiang vinegar (or rice vinegar)
1 teaspoon sugar
1 tablespoon finely sliced scallion greens
1 teaspoon ginger, grated on a microplane
To Cook:

Vegetable oil

Directions
For the Dough: place flour in bowl of food processor. With machine running, slowly drizzle in water until a cohesive dough forms (you probably won't need all the water). Allow dough to ride around processor for 30 seconds. The dough should be smooth and tacky. Form into a ball using floured hands and transfer to a bowl. Cover with a damp towel and let rest for at least 30 minutes.

For the Filling: Place cabbage and salt in food processor and pulse until finely chopped, about 10 one-second pulses. Transfer to a fine-meshed strainer set over a bowl. Allow to rest for 30 minutes. Meanwhile, place scallions, pork, soy sauce, Shaoxing wine, and sugar in bowl of food processor. Pulse until homogeneous and pasty, about 10 one-second pulses. Transfer to a large bowl and set aside.

Chopped cabbage being purged of liquid in a mesh strainer above a large metal mixing bowl.
After cabbage has purged, squeeze any remaining moisture out with your fingers, then transfer to the bowl with the pork. Fold together with a spatula until homogeneous. Microwave a small ball of the filling in a bowl for 10 seconds and eat it to taste for seasoning. Add more salt, soy sauce, or sugar as necessary and repeat tasting and seasoning until the filling tastes like you want it to. Refrigerate until ready to use.

Dumpling filling inside of a metal mixing bowl, being stirred by a silicone spatula with a wooden handle.
To Make the Dumplings: Divide dough into 4 sections. Roll each section into a 6-inch long log. Cut each section into 10 equal pieces and roll each into a ball, making 40 balls total (about 3.8 ounce; 10g each). On a well-floured work surface, roll each ball into a round 3 1/2- to 4-inches in diameter. Stack wrappers and keep under plastic until all of them are rolled out.

The dumpling dough rolled into balls on a heavily floured cutting board.
To form dumplings, place 1 tablespoon of filling in the center of a wrapper. Moisten the edges of the wrapper with a wet fingertip or a pastry brush. Fold in half and pinch the bottom-right corner closed. Pleat the front edge of the wrapper repeatedly, pinching the edge closed after each pleat until the entire dumpling is sealed. Transfer sealed dumplings to a lightly floured wooden or parchment-lined board.

A homemade dumpling wrapper in an open palm topped with a spoonful of filling.
To Make the Sauce: Combine all sauce ingredients in a small bowl and set aside at room temperature.

To Cook the Dumplings: Bring a large pot of water to a boil. Add 6 to 12 dumplings and boil until they float, about 1 minute. Continue boiling for 2 minutes longer, then transfer to a plate with a wire-mesh spider or slotted spoon. Heat 3 tablespoons vegetable oil in a 10-inch nonstick skillet or the bottom of a well-seasoned cast iron wok over medium heat until shimmering. Add dumplings flat-side down and cook, swirling occasionally, until bottom of dumplings are golden brown and crisp, about 3 minutes. Serve immediately with dipping sauce. Repeat step 7 with remaining dumplings, working in batches.

`;

const main = async () => {
  try {
    const recipeHTML = await getRecipeHTML(recipeUrl);
    const recipeBody = getRecipeBody(recipeHTML);
    console.log(recipeBody);
    const recipe = await extractRecipeChain.call({
      recipeBody,
    });
    console.log(recipe);
    // const recipeJSON = await transformTextToJSONChain.call({
    //   recipe: recipe.text,
    // });
    // console.log(recipeJSON);
  } catch (error) {
    handleAxiosError(error);
  }
};

// website -> get ingredients
// website -> get instructions
// combine instructions and ingredients

main();
