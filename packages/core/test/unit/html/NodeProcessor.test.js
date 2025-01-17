const path = require('path');
const cheerio = require('cheerio');
const htmlparser = require('htmlparser2');
const { getNewDefaultNodeProcessor } = require('../utils/utils');
const testData = require('./NodeProcessor.data');
const { Context } = require('../../../src/html/Context');
const { shiftSlotNodeDeeper, transformOldSlotSyntax } = require('../../../src/html/vueSlotSyntaxProcessor');

/**
 * Runs the processNode or postProcessNode method of NodeProcessor on the provided
 * template, verifying it with the expected result.
 * @param template The html template, which should only have one root element
 * @param expectedTemplate The expected result template
 * @param postProcess Boolean of whether to run postProcessNode instead of processNode.
 *                  Defaults to false
 */
const processAndVerifyTemplate = (template, expectedTemplate, postProcess = false) => {
  const handler = new htmlparser.DomHandler((error, dom) => {
    expect(error).toBeFalsy();

    const nodeProcessor = getNewDefaultNodeProcessor();

    if (postProcess) {
      /*
        Need to process node first (convert deprecated vue slot to updated shorthand syntax)
        before doing post-processing.
      */
      dom.forEach(node => nodeProcessor.processNode(node, new Context(path.resolve(''))));
      dom.forEach(node => nodeProcessor.postProcessNode(node));
    } else {
      dom.forEach(node => nodeProcessor.processNode(node, new Context(path.resolve(''))));
    }
    const result = cheerio.html(dom);

    expect(result).toEqual(expectedTemplate);
  });

  const htmlParser = new htmlparser.Parser(handler);

  htmlParser.parseComplete(template);
};

test('processNode processes panel attributes and inserts into dom as slots correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_PANEL_ATTRIBUTES,
                           testData.PROCESS_PANEL_ATTRIBUTES_EXPECTED);
  processAndVerifyTemplate(testData.PROCESS_PANEL_HEADER_NO_OVERRIDE,
                           testData.PROCESS_PANEL_HEADER_NO_OVERRIDE_EXPECTED);
});

test('processNode processes question attributes and inserts into dom as slots correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_QUESTION_ATTRIBUTES,
                           testData.PROCESS_QUESTION_ATTRIBUTES_EXPECTED);
  processAndVerifyTemplate(testData.PROCESS_QUESTION_ATTRIBUTES_NO_OVERRIDE,
                           testData.PROCESS_QUESTION_ATTRIBUTES_NO_OVERRIDE_EXPECTED);
});

test('processNode processes q-option attributes and inserts into dom as slots correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_QOPTION_ATTRIBUTES,
                           testData.PROCESS_QOPTION_ATTRIBUTES_EXPECTED);
  processAndVerifyTemplate(testData.PROCESS_QOPTION_ATTRIBUTES_NO_OVERRIDE,
                           testData.PROCESS_QOPTION_ATTRIBUTES_NO_OVERRIDE_EXPECTED);
});

test('processNode processes quiz attributes and inserts into dom as slots correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_QUIZ_ATTRIBUTES_EXPECTED,
                           testData.PROCESS_QUIZ_ATTRIBUTES_EXPECTED);
  processAndVerifyTemplate(testData.PROCESS_QUIZ_ATTRIBUTES_NO_OVERRIDE,
                           testData.PROCESS_QUIZ_ATTRIBUTES_NO_OVERRIDE_EXPECTED);
});

test('processNode processes popover attributes and inserts into dom as slots correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_POPOVER_ATTRIBUTES,
                           testData.PROCESS_POPOVER_ATTRIBUTES_EXPECTED);
  processAndVerifyTemplate(testData.PROCESS_POPOVER_ATTRIBUTES_NO_OVERRIDE,
                           testData.PROCESS_POPOVER_ATTRIBUTES_NO_OVERRIDE_EXPECTED);
});

test('processNode processes tooltip attributes and inserts into dom as slots correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_TOOLTIP_CONTENT,
                           testData.PROCESS_TOOLTIP_CONTENT_EXPECTED);
});

test('processNode processes modal attributes and inserts into dom as slots correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_MODAL_HEADER,
                           testData.PROCESS_MODAL_HEADER_EXPECTED);

  // todo remove these once 'modal-header' / 'modal-footer' for modal is fully deprecated
  processAndVerifyTemplate(testData.PROCESS_MODAL_SLOTS_RENAMING,
                           testData.PROCESS_MODAL_SLOTS_RENAMING_EXPECTED);

  // when the ok-text attr is set, footer shouldn't be disabled and ok-only attr should be added
  processAndVerifyTemplate(testData.PROCESS_MODAL_OK_TEXT,
                           testData.PROCESS_MODAL_OK_TEXT_EXPECTED);
});

test('processNode processes tab & tab-group attributes and inserts into dom as slots correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_TAB_HEADER,
                           testData.PROCESS_TAB_HEADER_EXPECTED);
  processAndVerifyTemplate(testData.PROCESS_TAB_GROUP_HEADER,
                           testData.PROCESS_TAB_GROUP_HEADER_EXPECTED);
});

test('processNode processes box attributes and inserts into dom as slots correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_BOX_ICON,
                           testData.PROCESS_BOX_ICON_EXPECTED);
  processAndVerifyTemplate(testData.PROCESS_BOX_HEADER,
                           testData.PROCESS_BOX_HEADER_EXPECTED);
});

test('postProcessNode assigns the correct panel id to panels', () => {
  processAndVerifyTemplate(testData.POST_PROCESS_PANEL_ID_ASSIGNED_USING_HEADER_SLOT,
                           testData.POST_PROCESS_PANEL_ID_ASSIGNED_USING_HEADER_SLOT_EXPECTED,
                           true);
});

test('processNode processes dropdown header attribute and inserts into DOM as header slot correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_DROPDOWN_HEADER,
                           testData.PROCESS_DROPDOWN_HEADER_EXPECTED);
});

test('processNode processes dropdown with header slot taking priority over header attribute', () => {
  processAndVerifyTemplate(testData.PROCESS_DROPDOWN_HEADER_SLOT_TAKES_PRIORITY,
                           testData.PROCESS_DROPDOWN_HEADER_SLOT_TAKES_PRIORITY_EXPECTED);
});

test('renderFile converts markdown headers to <h1> with an id', async () => {
  const nodeProcessor = getNewDefaultNodeProcessor();
  const indexPath = 'index.md';

  const result = await nodeProcessor.process(indexPath, '# Index');

  const expected = ['<h1 id="index"><span id="index" class="anchor"></span>Index</h1>'].join('\n');

  expect(result).toEqual(expected);
});

test('deprecated vue slot syntax should be converted to updated Vue slot shorthand syntax', async () => {
  // slot="test" converted to #test
  const test = '<panel><div slot="header">test</div><p slot="test">test2</p></panel>';

  const testNode = cheerio.parseHTML(test)[0];

  transformOldSlotSyntax(testNode);

  const expected = '<panel><div #header>test</div><p #test>test2</p></panel>';

  expect(cheerio.html(testNode)).toEqual(expected);
});

test('slot nodes which have tag names other than "template" are shifted one level deeper ', async () => {
  const test = '<panel><div #header>test</div></panel>';

  const testNode = cheerio.parseHTML(test)[0];

  shiftSlotNodeDeeper(testNode);

  const expected = '<panel><template #header><div>test</div></template></panel>';

  expect(cheerio.html(testNode)).toEqual(expected);
});
