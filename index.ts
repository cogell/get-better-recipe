import * as dotenv from 'dotenv';
// import { OpenAI } from 'langchain/llms/openai';
// import { PromptTemplate } from 'langchain/prompts';
// import { LLMChain } from 'langchain/chains';
import * as cherrio from 'cheerio';

import { Configuration, OpenAIApi } from 'openai';

dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const gpt3point5Turbo = 'gpt-3.5-turbo';

const config = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

const getIngredients = (recipe: string) => async () => {
  // https://platform.openai.com/docs/api-reference/chat
  const response = await openai.createChatCompletion({
    model: gpt3point5Turbo,
    // prompt: `Extract the ingredients from the text recipe below.

    // ${recipe}
    // `,
    messages: [
      {
        role: 'user',
        content: `Extract the ingredients from the text recipe below.
        
        ${recipe}`,
      },
    ],

    // maxTokens: 64,
    temperature: 0,
    // topP: 1.0, // not needed if using temperature
    // frequencyPenalty: 0,
    // presencePenalty: 0,
    // stop: ['\n'],
  });

  const data = response.data;
  const choices = data.choices;
  const choice = choices[0];
  const text = choice.message?.content;
  return text;
};

// const model = new OpenAI({
//   openAIApiKey: OPENAI_API_KEY,
//   modelName: 'gpt-3.5-turbo',
//   temperature: 0,
//   maxTokens: -1,
//   frequencyPenalty: 0,
//   presencePenalty: 0,
//   topP: 1.0,
// });

// const template = `Extract the ingredients and instructions from HTML recipe below, output as json with keys lowercase keys instructions and ingredients. For ingredients extract quantity if available.

//   {recipeBody}
//   `;

// const getIngredients = new LLMChain({
//   llm: model,
//   prompt: new PromptTemplate({
//     template: `Extract the ingredients from the text recipe below.

//     {recipeBody}
//     `,
//     inputVariables: ['recipeBody'],
//   }),
// });

// const getIngredients2 = new LLMChain({
//   llm: model,
//   prompt: new PromptTemplate({
//     template: `Extract the ingredients from the text recipe below.

//     {recipeBody}
//     `,
//     inputVariables: ['recipeBody'],
//   }),
// });

// const transformTextToJSONChain = new LLMChain({
//   llm: model,
//   prompt: new PromptTemplate({
//     template: `Transform the text below into JSON, with keys lowercase keys "instructions" and "ingredients".

//     {recipe}
//     `,
//     inputVariables: ['recipe'],
//   }),
// });

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

const main = async () => {
  try {
    const recipeHTML = await getRecipeHTML(recipeUrl);
    const recipeBody = getRecipeBody(recipeHTML);
    console.log(recipeBody);
    const recipe = await getIngredients(recipeBody)();
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
