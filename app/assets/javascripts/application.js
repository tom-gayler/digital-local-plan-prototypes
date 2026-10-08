//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

// Evidence tagging behaviour is opted into from markup via data attributes,
// so a page can carry more than one tag picker (the Review evidence screen
// has one for document passages and one for notes). Nothing here assumes a
// particular page or a single instance.
// One component failing must not take the rest of the page's JavaScript down with it — these
// all run in a single documentReady callback, so without this an error in any one of them
// leaves every component after it unwired, with nothing in the UI to say so. The error is
// still reported; it just stops being fatal to everything else.
function safeInit (init) {
  return element => {
    try {
      init(element)
    } catch (error) {
      console.error('Failed to initialise a component:', error)
    }
  }
}

window.GOVUKPrototypeKit.documentReady(() => {
  // Side navigation: mobile collapse/expand toggle
  document.querySelectorAll('[data-app-side-navigation-toggle]').forEach((button) => {
    const list = button.closest('.app-side-navigation__section').querySelector('.app-side-navigation__list')
    button.setAttribute('aria-expanded', 'true')
    button.addEventListener('click', () => {
      const isOpen = list.classList.toggle('app-side-navigation__list--open')
      button.setAttribute('aria-expanded', String(isOpen))
    })
  })

  document.querySelectorAll('[data-dlp-tagger]').forEach(safeInit(initTagger))
  document.querySelectorAll('[data-dlp-highlights]').forEach(safeInit(initSavedHighlights))
  document.querySelectorAll('[data-dlp-search]').forEach(safeInit(initDocumentSearch))
  document.querySelectorAll('[data-dlp-evidence-search]').forEach(safeInit(initEvidenceSearchModal))
  document.querySelectorAll('[data-dlp-resource-panel]').forEach(safeInit(initResourcePanel))
  document.querySelectorAll('[data-dlp-split]').forEach(safeInit(initSplitPane))
  document.querySelectorAll('[data-dlp-draft-check]').forEach(safeInit(initDraftCheck))
  document.querySelectorAll('[data-dlp-evidence-draggable]').forEach(safeInit(initEvidenceDraggable))
  document.querySelectorAll('[data-dlp-evidence-drop]').forEach(safeInit(initEvidenceDrop))
  document.querySelectorAll('[data-dlp-reference-flow]').forEach(safeInit(initReferenceFlow))
  document.querySelectorAll('[data-dlp-suggest]').forEach(safeInit(initSuggestSearch))
  document.querySelectorAll('[data-dlp-autosubmit]').forEach(safeInit(initAutosubmit))
  document.querySelectorAll('[data-dlp-select-all]').forEach(safeInit(initSelectAll))
  document.querySelectorAll('[data-dlp-template-picker]').forEach(safeInit(initTemplatePicker))

  // Opens the evidence search dialog from a button elsewhere on the page — in the v2 writer,
  // "+ Add source" in the sources rail. The search box lives inside the dialog, so this opens
  // it and hands over focus rather than scrolling to a box behind it.
  document.querySelectorAll('[data-dlp-open-evidence-search]').forEach(button => {
    button.addEventListener('click', () => {
      const modal = querySelectorOrNull(button.dataset.dlpOpenEvidenceSearch) ||
        document.querySelector('[data-dlp-search-modal]')
      if (!modal) return

      openModal(modal)
      const input = modal.querySelector('[data-dlp-search-input]')
      if (input) input.focus()
    })
  })
})

// Examination - inspector view: clicking a related-resource snippet shows its full text in the
// panel alongside it, replacing the "select a resource" empty state. Triggers live outside the
// panel itself, so they're found from the document rather than scoped to the panel.
function initResourcePanel (panel) {
  const emptyState = panel.querySelector('[data-dlp-resource-panel-empty]')
  const items = panel.querySelectorAll('[data-dlp-resource-panel-item]')
  const triggers = document.querySelectorAll('[data-dlp-resource-trigger]')

  triggers.forEach(trigger => {
    trigger.addEventListener('click', event => {
      // These are real links (a table of resources, not buttons) so a keyboard or assistive
      // tech user gets normal link semantics, but the destination is a panel elsewhere on the
      // page rather than a new location — the click swaps that panel's content in place.
      event.preventDefault()
      const targetId = trigger.dataset.resourceTarget

      triggers.forEach(candidate => {
        const row = candidate.closest('tr')
        const isSelected = candidate === trigger
        if (isSelected) {
          candidate.setAttribute('aria-current', 'true')
        } else {
          candidate.removeAttribute('aria-current')
        }
        if (row) row.classList.toggle('dlp-resource-row--selected', isSelected)
      })

      if (emptyState) emptyState.hidden = true
      items.forEach(item => {
        item.hidden = item.dataset.resourceId !== targetId
      })
    })
  })
}

// A tag picker: lozenges for tags and policy areas, an optional custom tag
// field, and a form whose hidden inputs are filled in on submit. It works in
// three shapes, chosen by markup:
//   - driven by a document viewer  (data-dlp-viewer="#some-viewer")
//   - a note                       (data-dlp-mode="note")
//   - fixed text                   (data-dlp-text="...")
function initTagger (root) {
  const form = root.querySelector('[data-dlp-form]')
  if (!form) return

  const fields = form.elements
  const part = name => root.querySelector('[data-dlp-' + name + ']')

  const viewer = querySelectorOrNull(root.dataset.dlpViewer)

  const modeButtons = root.querySelectorAll('[data-mode]')
  const modeSections = root.querySelectorAll('[data-mode-panel]')
  const selectedTextPreview = part('selected-text')
  const noteTextarea = part('note-text')
  const noteSourceTypeSelect = part('note-source-type')
  const topicLozenges = part('topic-lozenges')
  const policyLozenges = part('policy-lozenges')
  const customTagInput = part('custom-tag-input')
  const addCustomTagButton = part('custom-tag-add')

  const tagSearchInput = part('tag-search')
  const tagOptionsList = part('tag-options')
  const tagSearchSource = part('tag-search-source')

  let mode = root.dataset.dlpMode || 'passage'
  let currentSelectionText = root.dataset.dlpText || ''
  let selectedReference = ''
  const selectedTags = new Set()
  const selectedPolicyAreas = new Set()

  // Lozenges can arrive already pressed (the AI summary pre-selects its
  // suggested tags), so seed the sets from the markup.
  function seedPressed (container, tagSet) {
    if (!container) return
    container.querySelectorAll('[aria-pressed="true"]').forEach(button => {
      tagSet.add(button.dataset.tag)
    })
  }

  seedPressed(topicLozenges, selectedTags)
  seedPressed(policyLozenges, selectedPolicyAreas)

  function setMode (nextMode) {
    mode = nextMode
    modeButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.mode === mode))
    })
    modeSections.forEach(section => {
      section.hidden = section.dataset.modePanel !== mode
    })
  }

  modeButtons.forEach(button => {
    button.addEventListener('click', () => setMode(button.dataset.mode))
  })

  function updateSelectionPreview () {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return
    if (!viewer.contains(selection.anchorNode) || !viewer.contains(selection.focusNode)) return

    const text = selection.toString().trim()
    if (!text) return

    currentSelectionText = text
    if (selectedTextPreview) {
      selectedTextPreview.textContent = text
      selectedTextPreview.classList.remove('dlp-selected-text--empty')
    }
    if (modeButtons.length) setMode('passage')
  }

  if (viewer) {
    viewer.addEventListener('mouseup', updateSelectionPreview)
    viewer.addEventListener('keyup', updateSelectionPreview)
  }

  function toggleLozenge (button, tagSet) {
    const isPressed = button.getAttribute('aria-pressed') === 'true'

    // A lozenge that came from a tag search represents a chosen item rather
    // than a standing option, so deselecting it takes it off the list.
    if (isPressed && button.parentElement.hasAttribute('data-dlp-remove-on-deselect')) {
      if (button.dataset.kind === 'reference') selectedReference = ''
      tagSet.delete(button.dataset.tag)
      button.remove()
      return
    }

    button.setAttribute('aria-pressed', String(!isPressed))
    if (isPressed) {
      tagSet.delete(button.dataset.tag)
    } else {
      tagSet.add(button.dataset.tag)
    }
  }

  if (topicLozenges) {
    topicLozenges.addEventListener('click', event => {
      const button = event.target.closest('.dlp-lozenge')
      if (button) toggleLozenge(button, selectedTags)
    })
  }

  if (policyLozenges) {
    policyLozenges.addEventListener('click', event => {
      const button = event.target.closest('.dlp-lozenge')
      if (button) toggleLozenge(button, selectedPolicyAreas)
    })
  }

  // Presses an existing lozenge for this value, or adds one if the list
  // doesn't already offer it.
  function selectTag (value, modifierClass) {
    let button = Array.from(topicLozenges.querySelectorAll('.dlp-lozenge'))
      .find(candidate => candidate.dataset.tag.toLowerCase() === value.toLowerCase())

    if (!button) {
      button = document.createElement('button')
      button.type = 'button'
      button.className = 'dlp-lozenge' + (modifierClass ? ' ' + modifierClass : '')
      button.dataset.tag = value
      button.textContent = value
      topicLozenges.appendChild(button)
    }

    button.setAttribute('aria-pressed', 'true')
    selectedTags.add(button.dataset.tag)
    return button
  }

  function addCustomTag () {
    const value = customTagInput.value.trim()
    if (!value) return

    selectTag(value, 'dlp-lozenge--custom')
    customTagInput.value = ''
    customTagInput.focus()
  }

  if (customTagInput && topicLozenges) {
    if (addCustomTagButton) addCustomTagButton.addEventListener('click', addCustomTag)
    customTagInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault()
        addCustomTag()
      }
    })
  }

  // Tag search: instead of listing every tag up front, the user types and
  // picks from the matches. It searches tags and policy references
  // together, so one field covers both.
  if (tagSearchInput && tagOptionsList && tagSearchSource && topicLozenges) {
    let searchOptions = []
    try {
      searchOptions = JSON.parse(tagSearchSource.textContent)
    } catch (error) {
      searchOptions = []
    }

    function closeOptions () {
      tagOptionsList.innerHTML = ''
      tagOptionsList.hidden = true
      tagSearchInput.setAttribute('aria-expanded', 'false')
    }

    function chooseOption (option) {
      if (option.kind === 'reference') {
        const existing = topicLozenges.querySelector('[data-kind="reference"]')
        if (existing) {
          selectedTags.delete(existing.dataset.tag)
          existing.remove()
        }
        selectedReference = option.value
        selectTag(option.value, 'dlp-lozenge--reference').dataset.kind = 'reference'
        selectedTags.delete(option.value)
      } else {
        selectTag(option.value, option.kind === 'custom' ? 'dlp-lozenge--custom' : '')
      }

      tagSearchInput.value = ''
      closeOptions()
      tagSearchInput.focus()
    }

    tagSearchInput.addEventListener('input', () => {
      const term = tagSearchInput.value.trim().toLowerCase()
      tagOptionsList.innerHTML = ''

      if (!term) {
        closeOptions()
        return
      }

      const matches = searchOptions
        .filter(option => option.value.toLowerCase().indexOf(term) !== -1)
        .filter(option => option.kind === 'reference' || !selectedTags.has(option.value))
        .slice(0, 8)

      function addOption (option, kindLabel, modifierClass) {
        const item = document.createElement('li')
        item.setAttribute('role', 'option')

        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'dlp-typeahead__option' + (modifierClass ? ' ' + modifierClass : '')
        button.addEventListener('click', () => chooseOption(option))

        const label = document.createElement('span')
        label.textContent = option.value
        button.appendChild(label)

        const kind = document.createElement('span')
        kind.className = 'dlp-typeahead__kind'
        kind.textContent = kindLabel
        button.appendChild(kind)

        item.appendChild(button)
        tagOptionsList.appendChild(item)
      }

      matches.forEach(option => {
        addOption(option, option.kind === 'reference' ? 'Policy reference' : 'Tag')
      })

      // Nothing stops an officer needing a tag the list doesn't have yet, so
      // offer the typed text as a new one.
      const typed = tagSearchInput.value.trim()
      const exists = searchOptions.some(option => option.value.toLowerCase() === term) ||
        selectedTags.has(typed)

      if (!exists) {
        addOption({ value: typed, kind: 'custom' }, 'Add as new tag', 'dlp-typeahead__option--new')
      }

      // Everything typed is already chosen — nothing left to offer.
      if (!tagOptionsList.children.length) {
        closeOptions()
        return
      }

      tagOptionsList.hidden = false
      tagSearchInput.setAttribute('aria-expanded', 'true')
    })

    tagSearchInput.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeOptions()
      // Enter would otherwise submit the note before anything is chosen.
      if (event.key === 'Enter') event.preventDefault()
    })

    document.addEventListener('click', event => {
      if (!root.contains(event.target)) closeOptions()
    })
  }

  form.addEventListener('submit', event => {
    const noteText = mode === 'note' && noteTextarea ? noteTextarea.value.trim() : ''
    const tags = Array.from(selectedTags).join(',')
    const policyAreas = Array.from(selectedPolicyAreas).join(',')

    if (fields.entryType) fields.entryType.value = mode
    if (fields.selectedText) fields.selectedText.value = mode === 'passage' ? currentSelectionText : ''
    if (fields.noteText) fields.noteText.value = noteText
    if (fields.sourceType && noteSourceTypeSelect) {
      fields.sourceType.value = mode === 'note' ? noteSourceTypeSelect.value : ''
    }
    if (fields.tags) fields.tags.value = tags
    if (fields.policyAreas) fields.policyAreas.value = policyAreas
    // Only when a tag search owns the reference — elsewhere it's a select
    // the user sets directly.
    if (tagSearchInput && fields.policyReference) fields.policyReference.value = selectedReference

    if (mode === 'passage' && !currentSelectionText) {
      event.preventDefault()
      window.alert('Highlight some text in the document before saving.')
      return
    }
    if (mode === 'note' && !noteText) {
      event.preventDefault()
      window.alert('Add a note before saving.')
      return
    }
    if (!tags && !policyAreas) {
      event.preventDefault()
      window.alert('Choose at least one tag before saving.')
    }
  })
}

// Wraps previously saved passages in the document text with a highlight, and
// shows their tags underneath — so tagged evidence stays visible against the
// original wording rather than in a separate list only. The viewer names its
// own data source and its own tag-removal endpoint, so more than one screen
// can use this.
function initSavedHighlights (viewer) {
  const dataScript = querySelectorOrNull(viewer.dataset.dlpHighlights)
  if (!dataScript) return

  const options = {
    action: viewer.dataset.dlpRemoveAction || '/evidence/document-tagging/remove-tag',
    returnTo: viewer.dataset.dlpReturn || ''
  }

  let savedPassages = []
  try {
    savedPassages = JSON.parse(dataScript.textContent)
  } catch (error) {
    savedPassages = []
  }

  savedPassages.forEach(item => highlightPassage(viewer, item, options))
}

function highlightPassage (viewer, item, options) {
  const text = item.text
  if (!text) return

  const walker = document.createTreeWalker(viewer, NodeFilter.SHOW_TEXT)
  let node
  while ((node = walker.nextNode())) {
    const index = node.nodeValue.indexOf(text)
    if (index === -1) continue

    const range = document.createRange()
    range.setStart(node, index)
    range.setEnd(node, index + text.length)

    const mark = document.createElement('mark')
    mark.className = 'dlp-highlight'
    range.surroundContents(mark)

    const paragraph = mark.closest('p')
    if (paragraph) {
      addTagsBelowParagraph(paragraph, item, options)
    }
    break
  }
}

// Tags for a highlighted passage sit in a block underneath the paragraph
// that contains it, rather than inline with the highlight — so the
// paragraph's own text and spacing are never disturbed. Multiple tagged
// passages within the same paragraph share one row underneath it.
function addTagsBelowParagraph (paragraph, item, options) {
  let row = paragraph.nextElementSibling
  if (!row || !row.classList.contains('dlp-highlight-tags-row')) {
    row = document.createElement('div')
    row.className = 'dlp-highlight-tags-row'
    paragraph.insertAdjacentElement('afterend', row)
  }

  const group = document.createElement('span')
  group.className = 'dlp-highlight-tags-group'
  item.tags.concat(item.customTags).forEach(tag => {
    group.appendChild(createRemovableTagChip(item.id, tag, 'topic', options))
  })
  item.policyAreas.forEach(area => {
    group.appendChild(createRemovableTagChip(item.id, area, 'policy', options))
  })
  row.appendChild(group)
}

// Each tag chip is a real form that posts back to remove just that tag (or
// policy area) from the saved item — clicking it removes it, no extra JS
// wiring needed.
function createRemovableTagChip (itemId, tag, kind, options) {
  options = options || {}

  const form = document.createElement('form')
  form.className = 'dlp-chip-form'
  form.method = 'post'
  form.action = options.action || '/evidence/document-tagging/remove-tag'

  form.appendChild(hiddenField('itemId', itemId))
  form.appendChild(hiddenField('tag', tag))
  if (options.returnTo) form.appendChild(hiddenField('_returnTo', options.returnTo))

  const button = document.createElement('button')
  button.type = 'submit'
  button.className = 'dlp-chip dlp-chip--removable' + (kind === 'policy' ? ' dlp-chip--policy' : '')
  button.setAttribute('aria-label', 'Remove tag ' + tag)

  const label = document.createElement('span')
  label.textContent = tag
  button.appendChild(label)

  const removeIcon = document.createElement('span')
  removeIcon.className = 'dlp-chip__remove'
  removeIcon.setAttribute('aria-hidden', 'true')
  removeIcon.textContent = '×'
  button.appendChild(removeIcon)

  form.appendChild(button)
  return form
}

// A missing attribute gives undefined and an empty one gives '', both of
// which would make querySelector throw — so resolve defensively.
function querySelectorOrNull (selector) {
  if (!selector) return null
  try {
    return document.querySelector(selector)
  } catch (error) {
    return null
  }
}

function hiddenField (name, value) {
  const field = document.createElement('input')
  field.type = 'hidden'
  field.name = name
  field.value = value
  return field
}

// Keyword search across the full document text, listing the passages that
// match with the term marked. Client-side, so searching never reloads the
// page — a reload would drop the user back to the first tab.
function initDocumentSearch (root) {
  const input = root.querySelector('[data-dlp-search-input]')
  const results = root.querySelector('[data-dlp-search-results]')
  const count = root.querySelector('[data-dlp-search-count]')
  const dataScript = querySelectorOrNull(root.dataset.dlpSearchSource)
  if (!input || !results || !dataScript) return

  let paragraphs = []
  try {
    paragraphs = JSON.parse(dataScript.textContent)
  } catch (error) {
    paragraphs = []
  }

  input.addEventListener('input', () => {
    const term = input.value.trim()
    results.innerHTML = ''

    if (!term) {
      if (count) count.textContent = ''
      return
    }

    const matches = paragraphs.filter(paragraph => {
      return paragraph.toLowerCase().indexOf(term.toLowerCase()) !== -1
    })

    matches.forEach(paragraph => {
      const hit = document.createElement('p')
      hit.className = 'dlp-search__result'
      hit.innerHTML = markMatches(paragraph, term.toLowerCase())
      results.appendChild(hit)
    })

    if (!count) return
    count.textContent = matches.length
      ? matches.length + ' passage' + (matches.length === 1 ? '' : 's') + ' mention “' + term + '”'
      : 'No passages mention “' + term + '”'
  })
}

// Policy screen: searching the evidence base opens the matching passages in a
// modal as excerpts, ranked most relevant first. Each excerpt can be selected
// and the selection copied out, which is how an officer gets evidence from the
// search into whatever they're drafting. Uses a native <dialog>, so focus
// trapping and Escape-to-close come for free.

// Dropped when scoring, so a multi-word search isn't dominated by the words
// every passage contains.
const SEARCH_STOP_WORDS = [
  'and', 'the', 'of', 'for', 'in', 'on', 'to', 'with', 'from', 'by', 'at',
  'its', 'their', 'including'
]

function tokeniseSearch (term) {
  return term.toLowerCase()
    .split(/[^a-z0-9-]+/)
    .filter(word => word.length > 2 && SEARCH_STOP_WORDS.indexOf(word) === -1)
}

function countOccurrences (haystack, needle) {
  let count = 0
  let index = haystack.indexOf(needle)

  while (index !== -1) {
    count += 1
    index = haystack.indexOf(needle, index + needle.length)
  }

  return count
}

// Relevance, most significant signal first: the whole phrase in the passage,
// then the phrase in the document title, then each separate word. A passage
// already linked to the policy on screen, or already tagged into the evidence
// base, edges ahead of an equally good match that isn't.
function scorePassage (passage, phrase, words, currentPolicyRef) {
  const text = passage.text.toLowerCase()
  const source = (passage.source || '').toLowerCase()
  let score = countOccurrences(text, phrase) * 10

  // A document whose title carries the term is about the term, which beats a
  // passage that happens to repeat it — hence a title match outweighing a
  // second and third mention in the body.
  if (source.indexOf(phrase) !== -1) score += 12

  words.forEach(word => {
    const count = countOccurrences(text, word)
    if (count) score += 3 + Math.min(count - 1, 3)
    if (source.indexOf(word) !== -1) score += 4
  })

  if (!score) return 0

  if (currentPolicyRef && (passage.policyRefs || []).indexOf(currentPolicyRef) !== -1) score += 4
  if (passage.tagged) score += 2

  return score
}

function openModal (modal) {
  if (!modal || modal.open) return
  if (typeof modal.showModal === 'function') {
    modal.showModal()
  } else {
    modal.setAttribute('open', 'open')
  }
}

function initEvidenceSearchModal (root) {
  const input = root.querySelector('[data-dlp-search-input]')
  const submit = root.querySelector('[data-dlp-search-submit]')
  const dataScript = querySelectorOrNull(root.dataset.dlpSearchSource)
  // Instance-scoped when the page names the dialog this combobox drives, so one page can
  // carry more than one search. Falls back to the document-wide lookup for pages with one.
  const modal = querySelectorOrNull(root.dataset.dlpSearchModalTarget) ||
    document.querySelector('[data-dlp-search-modal]')
  if (!input || !dataScript || !modal) return

  const title = modal.querySelector('[data-dlp-modal-title]')
  const body = modal.querySelector('[data-dlp-modal-body]')
  const close = modal.querySelector('[data-dlp-modal-close]')
  const footer = modal.querySelector('[data-dlp-modal-footer]')
  const selectionCount = modal.querySelector('[data-dlp-selection-count]')
  const copyButton = modal.querySelector('[data-dlp-copy-selected]')
  const clearButton = modal.querySelector('[data-dlp-clear-selection]')
  const copyStatus = modal.querySelector('[data-dlp-copy-status]')
  // Present only where the modal adds the selection to something via a POST (the v2 writer)
  // rather than copying it to the clipboard (the policy summary). Both paths are guarded, so
  // a modal supplies whichever footer it wants and the other simply stays quiet.
  const addButton = modal.querySelector('[data-dlp-add-selected]')
  const selectedFields = modal.querySelector('[data-dlp-selected-fields]')

  const suggestions = root.querySelector('[data-dlp-search-suggestions]')
  const termsScript = querySelectorOrNull(root.dataset.dlpTermsSource)
  const currentPolicyRef = root.dataset.dlpCurrentPolicy || ''

  let passages = []
  try {
    passages = JSON.parse(dataScript.textContent)
  } catch (error) {
    passages = []
  }

  let searchTerms = []
  if (termsScript) {
    try {
      searchTerms = JSON.parse(termsScript.textContent)
    } catch (error) {
      searchTerms = []
    }
  }

  // The excerpts currently ticked, in the order they appear in the results.
  let results = []
  let selected = []

  function closeSuggestions () {
    if (!suggestions) return
    suggestions.innerHTML = ''
    suggestions.hidden = true
    input.setAttribute('aria-expanded', 'false')
  }

  function setCopyStatus (message) {
    if (copyStatus) copyStatus.textContent = message || ''
  }

  // Mirrors the current selection into hidden inputs so the modal footer can submit as an
  // ordinary form, with no fetch and no JSON endpoint. Named _selected[...] because the kit's
  // session middleware skips fields starting with "_" — a payload of full evidence excerpts
  // has no business being copied into req.session.data.
  function syncSelectedFields () {
    if (!selectedFields) return

    selectedFields.innerHTML = ''
    selected.forEach((passage, index) => {
      const values = {
        text: passage.text,
        source: passage.source || '',
        ref: passage.ref || '',
        policyRefs: (passage.policyRefs || []).join(',')
      }

      Object.keys(values).forEach(name => {
        const field = document.createElement('input')
        field.type = 'hidden'
        field.name = '_selected[' + index + '][' + name + ']'
        field.value = values[name]
        selectedFields.appendChild(field)
      })
    })
  }

  function updateSelection () {
    if (selectionCount) {
      selectionCount.textContent = selected.length
        ? selected.length + ' excerpt' + (selected.length === 1 ? '' : 's') + ' selected'
        : 'No excerpts selected'
    }
    if (copyButton) copyButton.disabled = selected.length === 0
    if (addButton) addButton.disabled = selected.length === 0
    if (clearButton) clearButton.hidden = selected.length === 0
    syncSelectedFields()
  }

  function clearSelection () {
    selected = []
    modal.querySelectorAll('[data-dlp-excerpt-checkbox]').forEach(checkbox => {
      checkbox.checked = false
      checkbox.closest('.dlp-excerpt').classList.remove('dlp-excerpt--selected')
    })
    setCopyStatus('')
    updateSelection()
  }

  function excerptAsText (passage) {
    const where = [passage.source, passage.ref].filter(Boolean).join(', ')
    const refs = (passage.policyRefs || []).length
      ? ' (Policy ' + passage.policyRefs.join(', ') + ')'
      : ''

    return '"' + passage.text + '"\n— ' + where + refs
  }

  // navigator.clipboard needs a secure context, which localhost is; the
  // textarea fallback covers anything served over plain http.
  function copyToClipboard (text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text)
    }

    return new Promise((resolve, reject) => {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', 'readonly')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()

      let copied = false
      try {
        copied = document.execCommand('copy')
      } catch (error) {
        copied = false
      }

      document.body.removeChild(area)
      if (copied) resolve()
      else reject(new Error('Copying is not available in this browser'))
    })
  }

  function renderExcerpt (passage, index, terms) {
    const item = document.createElement('li')
    item.className = 'dlp-excerpt'

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.className = 'dlp-excerpt__checkbox'
    checkbox.id = 'dlp-excerpt-' + index
    checkbox.setAttribute('data-dlp-excerpt-checkbox', '')

    const label = document.createElement('label')
    label.className = 'dlp-excerpt__label'
    label.setAttribute('for', checkbox.id)

    const text = document.createElement('span')
    text.className = 'dlp-excerpt__text'
    text.innerHTML = markTerms(passage.text, terms)
    label.appendChild(text)

    const meta = document.createElement('span')
    meta.className = 'dlp-excerpt__meta'

    const source = document.createElement('span')
    source.className = 'dlp-excerpt__source'
    source.textContent = [passage.source, passage.ref].filter(Boolean).join(', ')
    meta.appendChild(source)

    if ((passage.policyRefs || []).length) {
      const refs = document.createElement('span')
      refs.className = 'dlp-excerpt__refs'

      const refLabel = document.createElement('span')
      refLabel.className = 'govuk-visually-hidden'
      refLabel.textContent = 'Supports policy '
      refs.appendChild(refLabel)

      passage.policyRefs.forEach(ref => {
        const tag = document.createElement('span')
        tag.className = 'dlp-excerpt__ref'
        if (ref === currentPolicyRef) tag.classList.add('dlp-excerpt__ref--current')
        tag.textContent = ref
        refs.appendChild(tag)
      })

      meta.appendChild(refs)
    }

    label.appendChild(meta)

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selected.push(passage)
        item.classList.add('dlp-excerpt--selected')
      } else {
        selected = selected.filter(candidate => candidate !== passage)
        item.classList.remove('dlp-excerpt--selected')
      }
      setCopyStatus('')
      updateSelection()
    })

    item.appendChild(checkbox)
    item.appendChild(label)
    return item
  }

  function search (searchTerm) {
    const term = (searchTerm === undefined ? input.value : searchTerm).trim()
    if (!term) return

    input.value = term
    closeSuggestions()

    const phrase = term.toLowerCase()
    const words = tokeniseSearch(term)
    const terms = [phrase].concat(words.filter(word => word !== phrase))

    results = passages
      .map(passage => ({ passage, score: scorePassage(passage, phrase, words, currentPolicyRef) }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(result => result.passage)

    title.textContent = 'Evidence relating to “' + term + '”'
    body.innerHTML = ''
    selected = []
    setCopyStatus('')
    updateSelection()

    if (!results.length) {
      const empty = document.createElement('p')
      empty.className = 'govuk-body'
      empty.textContent = 'No evidence mentions “' + term + '”.'
      body.appendChild(empty)
      if (footer) footer.hidden = true
    } else {
      const count = document.createElement('p')
      count.className = 'govuk-body-s dlp-modal__count'
      count.textContent = results.length + ' excerpt' + (results.length === 1 ? '' : 's') +
        ', most relevant first. ' +
        (modal.dataset.dlpSelectionHint || 'Select the ones you want, then copy them.')
      body.appendChild(count)

      const list = document.createElement('ul')
      list.className = 'govuk-list dlp-excerpt-list'
      results.forEach((passage, index) => list.appendChild(renderExcerpt(passage, index, terms)))
      body.appendChild(list)

      if (footer) footer.hidden = false
    }

    body.scrollTop = 0

    openModal(modal)
  }

  if (copyButton) {
    copyButton.addEventListener('click', () => {
      if (!selected.length) return

      const text = selected.map(excerptAsText).join('\n\n')
      const copied = selected.length

      copyToClipboard(text).then(() => {
        setCopyStatus(copied + ' excerpt' + (copied === 1 ? '' : 's') + ' copied to your clipboard')
      }).catch(() => {
        setCopyStatus('Could not copy — your browser blocked access to the clipboard')
      })
    })
  }

  if (clearButton) clearButton.addEventListener('click', clearSelection)

  if (submit) submit.addEventListener('click', () => search())

  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeSuggestions()
      return
    }
    if (event.key !== 'Enter') return
    event.preventDefault()
    search()
  })

  // Type-ahead over policy titles and common evidence topics, so officers can
  // see the kinds of term worth searching for rather than guessing.
  if (suggestions && searchTerms.length) {
    input.addEventListener('input', () => {
      const term = input.value.trim().toLowerCase()
      suggestions.innerHTML = ''

      if (!term) {
        closeSuggestions()
        return
      }

      const matches = searchTerms
        .filter(option => option.term.toLowerCase().indexOf(term) !== -1)
        .slice(0, 8)

      if (!matches.length) {
        closeSuggestions()
        return
      }

      matches.forEach(option => {
        const item = document.createElement('li')
        item.setAttribute('role', 'option')

        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'dlp-typeahead__option'
        button.addEventListener('click', () => search(option.term))

        const label = document.createElement('span')
        label.textContent = option.term
        button.appendChild(label)

        const kind = document.createElement('span')
        kind.className = 'dlp-typeahead__kind'
        kind.textContent = option.kind
        button.appendChild(kind)

        item.appendChild(button)
        suggestions.appendChild(item)
      })

      suggestions.hidden = false
      input.setAttribute('aria-expanded', 'true')
    })

    document.addEventListener('click', event => {
      if (!root.contains(event.target)) closeSuggestions()
    })
  }

  if (close) close.addEventListener('click', () => modal.close())

  // Clicking the backdrop (i.e. the dialog element itself, outside its
  // content) closes it, matching what people expect of a modal.
  modal.addEventListener('click', event => {
    if (event.target === modal) modal.close()
  })

  updateSelection()
}

// Marks every search term in a passage, taking the earliest match each time so
// overlapping terms (the whole phrase and the words within it) can't nest.
function markTerms (original, terms) {
  const lower = original.toLowerCase()
  let result = ''
  let index = 0

  for (;;) {
    let at = -1
    let length = 0

    terms.forEach(term => {
      const found = lower.indexOf(term, index)
      if (found === -1) return
      if (at === -1 || found < at || (found === at && term.length > length)) {
        at = found
        length = term.length
      }
    })

    if (at === -1) break
    result += escapeHtml(original.slice(index, at))
    result += '<mark class="dlp-search-hit">' + escapeHtml(original.slice(at, at + length)) + '</mark>'
    index = at + length
  }

  return result + escapeHtml(original.slice(index))
}

function markMatches (original, term) {
  const lower = original.toLowerCase()
  let result = ''
  let index = 0

  for (;;) {
    const found = lower.indexOf(term, index)
    if (found === -1) break
    result += escapeHtml(original.slice(index, found))
    result += '<mark class="dlp-search-hit">' + escapeHtml(original.slice(found, found + term.length)) + '</mark>'
    index = found + term.length
  }

  return result + escapeHtml(original.slice(index))
}

function escapeHtml (value) {
  return value.replace(/[&<>"']/g, character => {
    switch (character) {
      case '&': return '&amp;'
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '"': return '&quot;'
      default: return '&#39;'
    }
  })
}

// A two-pane splitter with a draggable divider between the panes.
//
// Deliberately generic — the attributes say "split", not "draft" — because nothing here knows
// or cares what the panes contain. Widths come from a custom property the divider sets, so a
// drag touches one declaration rather than restyling either pane.
//
// Markup contract (every part optional except the root and the divider):
//   [data-dlp-split]                 the grid, carrying min/max/default/key in its dataset
//   [data-dlp-split-divider]         the separator; focusable, and the primary keyboard control
//   [data-dlp-split-pane="<name>"]   panes, whose names are read out in aria-valuetext
//   [data-dlp-split-close="<name>"]  closes that pane, giving the other the full width
//   [data-dlp-split-reopen="<name>"] reopens it; shown only while that pane is closed
//
// It also answers two events on the root, so other behaviour can open or close a pane without
// reaching into this one's state: "dlp-split-open" and "dlp-split-close" (the latter takes
// { detail: { pane } }). The evidence drag-and-drop uses these to reveal a closed panel as a
// drop target.
function initSplitPane (root) {
  const divider = root.querySelector('[data-dlp-split-divider]')
  if (!divider) return

  const min = Number(root.dataset.dlpSplitMin) || 25
  const max = Number(root.dataset.dlpSplitMax) || 75
  const initial = Number(root.dataset.dlpSplitDefault) || 50
  const storageKey = 'dlp-split:' + (root.dataset.dlpSplitKey || 'default')

  const panes = Array.prototype.slice.call(root.querySelectorAll('[data-dlp-split-pane]'))
  const firstName = (panes[0] && panes[0].dataset.dlpSplitPane) || 'first panel'
  const secondName = (panes[1] && panes[1].dataset.dlpSplitPane) || 'second panel'

  function clamp (value) {
    return Math.min(max, Math.max(min, Math.round(value)))
  }

  // The chosen width is viewport ergonomics rather than journey state, so it lives in the
  // browser instead of session data — storing it server-side would mean a POST per drag.
  // Private browsing makes these throw, hence the try/catch on both sides.
  function readStoredFraction () {
    try {
      const stored = Number(window.localStorage.getItem(storageKey))
      return stored >= min && stored <= max ? stored : null
    } catch (error) {
      return null
    }
  }

  function storeFraction (value) {
    try {
      window.localStorage.setItem(storageKey, String(value))
    } catch (error) {
      // Nothing to do — the split still works, it just won't be remembered.
    }
  }

  const closeButtons = Array.prototype.slice.call(root.querySelectorAll('[data-dlp-split-close]'))
  // The reopen control lives in the pane that stays, so it is still reachable once the other
  // one is gone.
  const reopenButtons = Array.prototype.slice.call(root.querySelectorAll('[data-dlp-split-reopen]'))

  let fraction = readStoredFraction() || initial

  function readStoredClosed () {
    try {
      return window.localStorage.getItem(storageKey + ':closed') || ''
    } catch (error) {
      return ''
    }
  }

  function storeClosed (name) {
    try {
      window.localStorage.setItem(storageKey + ':closed', name || '')
    } catch (error) {
      // Nothing to do — closing still works, it just will not be remembered.
    }
  }

  // Closing a pane hides it and the divider and gives the remaining pane the whole row.
  function setClosedPane (name, options) {
    panes.forEach(pane => {
      pane.hidden = Boolean(name) && pane.dataset.dlpSplitPane === name
    })

    divider.hidden = Boolean(name)
    root.classList.toggle('dlp-split--collapsed', Boolean(name))
    closeButtons.forEach(button => { button.hidden = Boolean(name) })
    reopenButtons.forEach(button => {
      button.hidden = button.dataset.dlpSplitReopen !== name
    })

    if (!options || options.persist !== false) storeClosed(name)
  }

  function setFraction (value, options) {
    fraction = clamp(value)
    root.style.setProperty('--dlp-split-fraction', fraction + '%')
    divider.setAttribute('aria-valuenow', String(fraction))
    divider.setAttribute('aria-valuetext',
      firstName + ' ' + fraction + '%, ' + secondName + ' ' + (100 - fraction) + '%')
    if (!options || options.persist !== false) storeFraction(fraction)
  }

  divider.setAttribute('aria-valuemin', String(min))
  divider.setAttribute('aria-valuemax', String(max))
  setFraction(fraction, { persist: false })

  divider.addEventListener('pointerdown', event => {
    event.preventDefault()
    if (divider.setPointerCapture) divider.setPointerCapture(event.pointerId)
    root.classList.add('dlp-split--dragging')
  })

  divider.addEventListener('pointermove', event => {
    if (!divider.hasPointerCapture || !divider.hasPointerCapture(event.pointerId)) return
    const rect = root.getBoundingClientRect()
    if (!rect.width) return
    // Not persisted mid-drag; the pointerup below writes the value the user settled on.
    setFraction(((event.clientX - rect.left) / rect.width) * 100, { persist: false })
  })

  function endDrag (event) {
    if (divider.hasPointerCapture && divider.hasPointerCapture(event.pointerId)) {
      divider.releasePointerCapture(event.pointerId)
    }
    root.classList.remove('dlp-split--dragging')
    storeFraction(fraction)
  }

  divider.addEventListener('pointerup', endDrag)
  divider.addEventListener('pointercancel', endDrag)
  divider.addEventListener('dblclick', () => setFraction(initial))

  // The keyboard path is the real control, not a concession: dragging a 4px divider is the
  // harder way to do this even with a mouse.
  divider.addEventListener('keydown', event => {
    let next = null

    if (event.key === 'ArrowLeft') next = fraction - 2
    else if (event.key === 'ArrowRight') next = fraction + 2
    else if (event.key === 'PageDown') next = fraction - 10
    else if (event.key === 'PageUp') next = fraction + 10
    else if (event.key === 'Home') next = min
    else if (event.key === 'End') next = max
    else if (event.key === 'Enter' || event.key === ' ') next = fraction === initial ? max : initial

    if (next === null) return
    event.preventDefault()
    setFraction(next)
  })

  closeButtons.forEach(button => {
    button.addEventListener('click', () => setClosedPane(button.dataset.dlpSplitClose))
  })

  reopenButtons.forEach(button => {
    button.addEventListener('click', () => setClosedPane(''))
  })

  // Opening and closing from elsewhere, without that code needing to know how this works.
  // persist: false — a panel revealed to catch a drop should not become the remembered state.
  root.addEventListener('dlp-split-open', event => {
    setClosedPane('', (event.detail || {}).persist === false ? { persist: false } : undefined)
  })

  root.addEventListener('dlp-split-close', event => {
    const detail = event.detail || {}
    setClosedPane(detail.pane || '', detail.persist === false ? { persist: false } : undefined)
  })

  // Applied last, so a pane closed on a previous visit comes back closed.
  setClosedPane(readStoredClosed(), { persist: false })
}

// "Check references" — how well does this draft actually use the evidence attached to it?
//
// This is string matching, not a language model: it counts word overlap between the draft and
// each attached source, looks for placeholder and hedging wording, and re-runs the evidence
// search using terms taken from what has been typed. The confidence labels and the
// "check each suggestion against the source" caveat are there because it will produce false
// negatives on genuine paraphrase and false positives on shared planning vocabulary. The
// thresholds below are tuned by eye against the seeded drafts.
//
// It runs in the browser, on the current contents of the textarea, so it reflects unsaved
// typing. A server-side version could only ever see the last saved draft.

const DRAFT_PLACEHOLDER_PATTERNS = [
  { pattern: /circa X\b/gi, label: 'Placeholder figure' },
  { pattern: /\bX (homes|jobs|sqm|dwellings|units)\b/gi, label: 'Placeholder figure' },
  { pattern: /\[[^\]]{1,60}\]/g, label: 'Placeholder text' },
  { pattern: /\bTBC\b|\bto be confirmed\b/gi, label: 'Unresolved content' },
  { pattern: /\bTODO\b|\bXX+\b/g, label: 'Unresolved content' }
]

const DRAFT_WEAK_WORDING_PATTERNS = [
  { pattern: /\bwhere possible\b/gi, suggestion: 'State the circumstances this applies in, or use “must”.' },
  { pattern: /\bshould consider\b/gi, suggestion: '“Will be expected to” or “must” is enforceable; “should consider” is not.' },
  { pattern: /\bas appropriate\b/gi, suggestion: 'Say who decides what is appropriate, and against what.' },
  { pattern: /\bencouraged to\b/gi, suggestion: 'Encouragement carries little weight at appeal — consider “will be expected to”.' },
  { pattern: /\bwhere feasible\b/gi, suggestion: 'Say what would make this infeasible, or the test cannot be applied.' }
]

// A passage has to beat a single stray word match to be worth suggesting.
const DRAFT_SUGGESTION_FLOOR = 10

function readJsonFrom (selector) {
  const script = querySelectorOrNull(selector)
  if (!script) return []
  try {
    return JSON.parse(script.textContent) || []
  } catch (error) {
    return []
  }
}

function initDraftCheck (root) {
  const runButton = root.querySelector('[data-dlp-draft-check-run]')
  const review = root.querySelector('[data-dlp-draft-review]')
  const panels = root.querySelector('[data-dlp-draft-check-panels]')
  const summaryLine = root.querySelector('[data-dlp-draft-check-summary]')
  const draftInput = querySelectorOrNull(root.dataset.dlpDraftInput)
  if (!runButton || !review || !draftInput) return

  const corpus = readJsonFrom(root.dataset.dlpCorpusSource)
  const attached = readJsonFrom(root.dataset.dlpSourcesSource)
  const searchTerms = readJsonFrom(root.dataset.dlpTermsSource)
  const currentPolicyRef = root.dataset.dlpCurrentPolicy || ''
  const addSourceAction = root.dataset.dlpAddSourceAction || ''

  // How many corpus passages each word appears in. Used to judge how distinctive a word is:
  // "overheating" appears in a handful of passages and identifies a subject, "development"
  // appears in dozens and identifies nothing.
  //
  // Built on FIRST USE, never at init. This function runs inside documentReady, which the kit
  // fires synchronously — and because the bundle is a deferred module, that happens while the
  // module is still evaluating, before the const SEARCH_STOP_WORDS further down this file has
  // been initialised. Calling tokeniseSearch here threw a temporal-dead-zone ReferenceError
  // that took the whole documentReady block down with it. Deferring also means a page where
  // the check is never run does none of this work.
  let docFrequencyCache = null

  function documentFrequency () {
    if (docFrequencyCache) return docFrequencyCache

    const counts = {}
    corpus.forEach(passage => {
      const seen = {}
      tokeniseSearch(passage.text || '').forEach(word => {
        if (seen[word]) return
        seen[word] = true
        counts[word] = (counts[word] || 0) + 1
      })
    })

    docFrequencyCache = counts
    return docFrequencyCache
  }

  // Words appearing in more than half the attached sources are planning boilerplate rather
  // than evidence of a citation, so they can't carry an overlap score on their own.
  function buildCommonWords () {
    if (attached.length < 2) return []
    const counts = {}

    attached.forEach(source => {
      const seen = {}
      tokeniseSearch(source.text || '').forEach(word => {
        if (seen[word]) return
        seen[word] = true
        counts[word] = (counts[word] || 0) + 1
      })
    })

    return Object.keys(counts).filter(word => counts[word] > attached.length / 2)
  }

  function assessSource (source, draftLower, commonWords) {
    const title = (source.source || '').toLowerCase()
    const ref = (source.ref || '').toLowerCase()
    const named = (title && draftLower.indexOf(title) !== -1) ||
      (ref && ref.length > 4 && draftLower.indexOf(ref) !== -1)

    const words = tokeniseSearch(source.text || '')
      .filter(word => commonWords.indexOf(word) === -1)
    const matched = words.filter(word => countOccurrences(draftLower, word) > 0)
    const overlap = words.length ? matched.length / words.length : 0

    // Overlap with the document's TITLE, scored separately. A passage and its document are
    // not the same thing: a draft can be plainly about the Surface Water Management Plan while
    // sharing little wording with the particular paragraph quoted from it.
    const titleWords = tokeniseSearch(source.source || '')
    const titleOverlap = titleWords.length
      ? titleWords.filter(word => countOccurrences(draftLower, word) > 0).length / titleWords.length
      : 0

    let state = 'missing'
    if (named) state = 'named'
    else if (overlap >= 0.34) state = 'paraphrased'
    else if (overlap >= 0.15) state = 'weak'

    // Suggestions are scored on title as well as body (see scorePassage), so without this the
    // two halves of the check contradict each other: it recommends a source, and then reports
    // the source you just accepted as unreferenced.
    if ((state === 'missing' || state === 'weak') && titleOverlap >= 0.5) state = 'paraphrased'

    return { source, state, overlap, matched }
  }

  function sentenceAround (text, index) {
    let start = index
    while (start > 0 && '.!?\n'.indexOf(text.charAt(start - 1)) === -1) start -= 1
    let end = index
    while (end < text.length && '.!?\n'.indexOf(text.charAt(end)) === -1) end += 1
    return text.slice(start, Math.min(end + 1, text.length)).trim()
  }

  function findPatternHits (draft, patterns) {
    const hits = []

    patterns.forEach(entry => {
      entry.pattern.lastIndex = 0
      let match

      while ((match = entry.pattern.exec(draft)) !== null) {
        hits.push({ match: match[0], index: match.index, entry })
        if (!entry.pattern.global) break
        // A zero-length match would spin here forever.
        if (match.index === entry.pattern.lastIndex) entry.pattern.lastIndex += 1
      }
    })

    // The patterns overlap by design — "circa X homes" is matched by both the "circa X" and
    // the "X homes" rule — so keep the longest match starting earliest and drop anything
    // nested inside it. Without this one placeholder is reported several times over.
    hits.sort((a, b) => a.index - b.index || b.match.length - a.match.length)

    const kept = []
    let consumedTo = -1

    hits.forEach(hit => {
      if (hit.index < consumedTo) return
      kept.push(hit)
      consumedTo = hit.index + hit.match.length
    })

    return kept
  }

  // Search phrases come from what the user actually typed — the most frequent words, plus any
  // multi-word term from the type-ahead vocabulary that appears verbatim, so "surface water"
  // is treated as a phrase rather than two unrelated words.
  function suggestReferences (draft, draftLower) {
    const counts = {}
    tokeniseSearch(draft).forEach(word => { counts[word] = (counts[word] || 0) + 1 })

    // Ranking by raw count does not work here: in a short draft nearly every word occurs
    // once, so the sort collapses into document order and the opening boilerplate
    // ("Development must be...") crowds out the words that say what the policy is about.
    // Weighting each count by how rare the word is across the corpus fixes that.
    const docFrequency = documentFrequency()
    const phrases = Object.keys(counts)
      // A word that appears nowhere in the corpus can never match a passage, so including it
      // would only use up a slot.
      .filter(word => docFrequency[word])
      .sort((a, b) =>
        (counts[b] / docFrequency[b]) - (counts[a] / docFrequency[a]))
      .slice(0, 8)

    searchTerms.forEach(term => {
      const value = String(term && term.value ? term.value : term).toLowerCase()
      if (value.indexOf(' ') !== -1 && draftLower.indexOf(value) !== -1) phrases.push(value)
    })

    const alreadyAttached = {}
    attached.forEach(source => { alreadyAttached[source.text] = true })

    const scored = []
    corpus.forEach(passage => {
      if (alreadyAttached[passage.text]) return

      let best = 0
      phrases.forEach(phrase => {
        const score = scorePassage(passage, phrase, tokeniseSearch(phrase), currentPolicyRef)
        if (score > best) best = score
      })

      if (best >= DRAFT_SUGGESTION_FLOOR) scored.push({ passage, score: best })
    })

    return scored.sort((a, b) => b.score - a.score).slice(0, 3)
  }

  // --- Rendering -----------------------------------------------------------------------
  //
  // The review takes the place of the textarea, in the editing box, so what you read back is
  // your own draft with the evidence marked on it. Sentences that draw on an attached source
  // are marked and numbered [1], [2] …, matching the numbered key below the box; where the
  // check finds evidence the draft clearly relates to but has not been attached, it offers
  // "Add reference to … here" at the point in the text where it belongs.
  //
  // Everything is built with createElement/createTextNode/textContent — the draft is user
  // input and is quoted back in full, so none of it goes near innerHTML.

  function sourceLabel (source) {
    return [source.source, source.ref].filter(Boolean).join(', ')
  }

  // Sentence boundaries, with offsets into the original draft so marks land in the right place.
  // A reference belongs to a sentence: a paragraph is too coarse to say where the evidence is
  // being used, and a word is too fine to be a citation.
  function splitSentences (text, offset) {
    const spans = []
    let start = 0
    let depth = 0

    for (let index = 0; index < text.length; index += 1) {
      const character = text.charAt(index)

      // Terminators inside brackets do not end a sentence. Drafters write "[Total Number,
      // e.g., 12,500]" and "(2026–2041)", and splitting on those full stops used to leave a
      // placeholder straddling two sentences — which meant it was counted as a wording issue
      // but never highlighted, because a mark cannot span a sentence boundary.
      if (character === '[' || character === '(') depth += 1
      else if (character === ']' || character === ')') depth = Math.max(0, depth - 1)

      const terminator = character === '.' || character === '!' || character === '?'
      if ((terminator && !depth) || character === '\n') {
        const slice = text.slice(start, index + 1)
        if (slice.trim()) spans.push({ start: offset + start, end: offset + index + 1, text: slice })
        start = index + 1
      }
    }

    const tail = text.slice(start)
    if (tail.trim()) spans.push({ start: offset + start, end: offset + text.length, text: tail })

    return spans
  }

  // Which attached sources a single sentence draws on, by the same measure used for the whole
  // draft, so the marks in the text and the key underneath can't disagree.
  function referencesIn (sentence, commonWords) {
    const sentenceLower = sentence.toLowerCase()
    const refs = []

    attached.forEach((source, index) => {
      const state = assessSource(source, sentenceLower, commonWords).state
      if (state === 'named' || state === 'paraphrased') {
        refs.push({ number: index + 1, source, state })
      }
    })

    return refs
  }

  function addSourceButton (passage, label) {
    const form = document.createElement('form')
    form.className = 'dlp-pw2-suggest'
    form.method = 'post'
    form.action = addSourceAction

    const values = {
      text: passage.text,
      source: passage.source || '',
      ref: passage.ref || '',
      policyRefs: (passage.policyRefs || []).join(',')
    }

    Object.keys(values).forEach(name => {
      const field = document.createElement('input')
      field.type = 'hidden'
      field.name = '_selected[0][' + name + ']'
      field.value = values[name]
      form.appendChild(field)
    })

    const button = document.createElement('button')
    button.type = 'submit'
    button.className = 'dlp-pw2-suggest__button'
    button.textContent = label
    form.appendChild(button)

    return form
  }

  // Renders one sentence's text, marking placeholders and unenforceable wording inside it.
  function appendMarkedText (parent, text, offset, marks) {
    const local = marks
      .filter(mark => mark.start >= offset && mark.end <= offset + text.length)
      .map(mark => ({ start: mark.start - offset, end: mark.end - offset, type: mark.type, note: mark.note }))
      .sort((a, b) => a.start - b.start)

    let cursor = 0
    local.forEach(span => {
      if (span.start > cursor) {
        parent.appendChild(document.createTextNode(text.slice(cursor, span.start)))
      }

      const mark = document.createElement('mark')
      mark.className = 'dlp-pw2-mark dlp-pw2-mark--' + span.type
      mark.title = span.note
      mark.appendChild(document.createTextNode(text.slice(span.start, span.end)))

      // The highlight must never be colour alone.
      const hidden = document.createElement('span')
      hidden.className = 'govuk-visually-hidden'
      hidden.textContent = ' (flagged: ' + span.note + ') '
      mark.appendChild(hidden)

      parent.appendChild(mark)
      cursor = span.end
    })

    if (cursor < text.length) parent.appendChild(document.createTextNode(text.slice(cursor)))
    return local
  }

  function renderReviewDocument (draft, marks, sentenceRefs, missingBySentence) {
    const doc = document.createDocumentFragment()
    let offset = 0

    draft.split('\n\n').forEach((paragraphText, index) => {
      if (index > 0) offset += 2
      const paragraphStart = offset
      offset += paragraphText.length
      if (!paragraphText.trim()) return

      const paragraph = document.createElement('p')
      paragraph.className = 'dlp-pw2-draft__para'

      splitSentences(paragraphText, paragraphStart).forEach(sentence => {
        const refs = sentenceRefs[sentence.start] || []

        // A referenced sentence is wrapped, so inline marks can still sit inside it — nesting
        // one <mark> in another is not something you can rely on rendering sensibly.
        const container = refs.length ? document.createElement('span') : paragraph
        if (refs.length) container.className = 'dlp-pw2-cited'

        appendMarkedText(container, sentence.text, sentence.start, marks)

        refs.forEach(ref => {
          const marker = document.createElement('sup')
          marker.className = 'dlp-pw2-refnum'
          marker.title = sourceLabel(ref.source)
          marker.textContent = '[' + ref.number + ']'

          const hidden = document.createElement('span')
          hidden.className = 'govuk-visually-hidden'
          hidden.textContent = ' reference ' + ref.number + ', ' + sourceLabel(ref.source) + ' '
          marker.appendChild(hidden)

          container.appendChild(marker)
        })

        if (container !== paragraph) paragraph.appendChild(container)

        // Evidence the draft plainly relates to, offered where it belongs rather than in a list.
        const missing = missingBySentence[sentence.start]
        if (missing && addSourceAction) {
          paragraph.appendChild(addSourceButton(
            missing.passage, '+ Add reference to ' + sourceLabel(missing.passage) + ' here'))
        }
      })

      doc.appendChild(paragraph)
    })

    return doc
  }

  const STATE_WORDS = {
    named: 'Cited by name',
    paraphrased: 'Used, not named',
    weak: 'Barely used',
    missing: 'Not used'
  }

  // The key that makes the [1]/[2] markers in the text mean something.
  function renderSourceKey (assessments, usedStates) {
    const section = document.createElement('section')
    section.className = 'dlp-pw2-key'

    const heading = document.createElement('h3')
    heading.className = 'dlp-pw2-key__heading'
    heading.textContent = 'References'
    section.appendChild(heading)

    const list = document.createElement('ol')
    list.className = 'dlp-pw2-key__list'

    assessments.forEach((assessment, index) => {
      // "named"/"paraphrased" only where a sentence is actually marked with this number;
      // otherwise fall back to how close the whole draft came.
      const state = usedStates[index] ||
        (assessment.overlap >= 0.15 ? 'weak' : 'missing')

      const item = document.createElement('li')
      item.className = 'dlp-pw2-key__item dlp-pw2-key__item--' + state

      const number = document.createElement('span')
      number.className = 'dlp-pw2-key__number'
      number.textContent = '[' + (index + 1) + ']'

      const label = document.createElement('span')
      label.className = 'dlp-pw2-key__label'
      label.textContent = sourceLabel(assessment.source)

      const stateLabel = document.createElement('span')
      stateLabel.className = 'dlp-pw2-key__state'
      stateLabel.textContent = STATE_WORDS[state]

      item.appendChild(number)
      item.appendChild(label)
      item.appendChild(stateLabel)
      list.appendChild(item)
    })

    section.appendChild(list)
    return section
  }

  // A small labelled swatch, used for the legend under the review.
  function annotationChip (text, type) {
    const chip = document.createElement('span')
    chip.className = 'dlp-pw2-chip dlp-pw2-chip--' + type
    chip.textContent = text
    return chip
  }

  // The legend and the caveat, as plain lines rather than a panel of their own. The marks are
  // meaningless without a key, and anything generated needs to say that it was.
  function renderReviewNotes (marks) {
    const notes = document.createElement('div')
    notes.className = 'dlp-pw2-review-notes'

    if (marks.length) {
      const legend = document.createElement('p')
      legend.className = 'dlp-pw2-legend'
      legend.appendChild(annotationChip('Placeholder', 'placeholder'))
      legend.appendChild(annotationChip('Not enforceable', 'wording'))
      notes.appendChild(legend)
    }

    const caveat = document.createElement('p')
    caveat.className = 'dlp-pw2-review-notes__caveat'
    caveat.textContent = 'AI generated — check each suggestion against the source before using it.'
    notes.appendChild(caveat)

    if (!attached.length) {
      const none = document.createElement('p')
      none.className = 'dlp-pw2-review-notes__caveat'
      none.textContent = 'No sources are attached to this policy yet — add some with “+ Add source”.'
      notes.appendChild(none)
    }

    return notes
  }

  // Deliberately leaves the panes alone: the review swaps in where the textarea was, and the
  // evidence panel stays exactly as the drafter left it. The box fills its frame through CSS
  // (see [data-dlp-split-pane="draft"] in _policy-writing-v2.scss), not by taking the panel's
  // space away.
  function showReview (on) {
    review.hidden = !on
    draftInput.hidden = on
    if (panels) panels.hidden = !on
    runButton.setAttribute('aria-pressed', String(on))
  }

  function run () {
    const draft = draftInput.value || ''
    const draftLower = draft.toLowerCase()
    const draftWords = draft.trim() ? draft.trim().split(/\s+/).length : 0

    review.innerHTML = ''
    if (panels) panels.innerHTML = ''

    if (!draftWords) {
      if (summaryLine) {
        summaryLine.textContent = 'Nothing to check yet — start drafting, or insert a template to work from.'
      }
      return
    }

    const commonWords = buildCommonWords()
    const assessments = attached.map(source => assessSource(source, draftLower, commonWords))

    const found = []
    findPatternHits(draft, DRAFT_PLACEHOLDER_PATTERNS).forEach(hit => {
      found.push({ start: hit.index, end: hit.index + hit.match.length, type: 'placeholder', note: hit.entry.label })
    })
    findPatternHits(draft, DRAFT_WEAK_WORDING_PATTERNS).forEach(hit => {
      found.push({ start: hit.index, end: hit.index + hit.match.length, type: 'wording', note: hit.entry.suggestion })
    })

    // findPatternHits settles overlaps within one pass, but the two passes are independent,
    // and one <mark> cannot be half inside another — so settle across them the same way.
    found.sort((a, b) => a.start - b.start || b.end - a.end)
    const marks = []
    let consumedTo = -1
    found.forEach(span => {
      if (span.start < consumedTo) return
      marks.push(span)
      consumedTo = span.end
    })

    // Place each suggestion against the sentence it best fits, so "add a reference" appears
    // where the reference would go rather than in a list at the bottom.
    const allSentences = []
    let offset = 0
    draft.split('\n\n').forEach((paragraphText, index) => {
      if (index > 0) offset += 2
      splitSentences(paragraphText, offset).forEach(sentence => allSentences.push(sentence))
      offset += paragraphText.length
    })

    const sentenceRefs = {}
    const usedStates = []
    allSentences.forEach(sentence => {
      const refs = referencesIn(sentence.text, commonWords)
      sentenceRefs[sentence.start] = refs
      refs.forEach(ref => {
        // "named" beats "paraphrased": one sentence citing the document by name settles it.
        if (usedStates[ref.number - 1] !== 'named') usedStates[ref.number - 1] = ref.state
      })
    })

    const missingBySentence = {}
    let missingCount = 0
    suggestReferences(draft, draftLower).forEach(suggestion => {
      let best = null
      let bestScore = 0

      allSentences.forEach(sentence => {
        if (missingBySentence[sentence.start]) return
        const phrase = (suggestion.passage.source || '').toLowerCase()
        const score = scorePassage(
          { text: sentence.text, source: '', policyRefs: [] },
          phrase,
          tokeniseSearch(suggestion.passage.text || ''),
          '')
        if (score > bestScore) { bestScore = score; best = sentence }
      })

      if (best) {
        missingBySentence[best.start] = suggestion
        missingCount += 1
      }
    })

    review.appendChild(renderReviewDocument(draft, marks, sentenceRefs, missingBySentence))
    if (panels) {
      if (assessments.length) panels.appendChild(renderSourceKey(assessments, usedStates))
      panels.appendChild(renderReviewNotes(marks))
    }

    showReview(true)
    review.focus()

    if (summaryLine) {
      const cited = usedStates.filter(Boolean).length
      summaryLine.textContent = 'Draft marked up: ' + cited + ' of ' + assessments.length +
        ' sources used, ' + marks.length + ' wording issues, ' + missingCount + ' references suggested.'
    }
  }

  review.addEventListener('click', event => {
    // Controls only — not 'form': the whole drafting pane is one form, so closest('form')
    // matches every click in here and nothing would ever return to editing.
    if (event.target.closest('button, a, input, select, textarea, label')) return
    showReview(false)
    draftInput.focus()
  })

  runButton.addEventListener('click', () => {
    if (runButton.getAttribute('aria-pressed') === 'true') {
      showReview(false)
      draftInput.focus()
      if (summaryLine) summaryLine.textContent = ''
      return
    }
    run()
  })
}

// Dragging a source from the sidebar into the evidence panel to read it.
//
// Strictly an accelerator: every source in the rail is also a link that does the same thing, so
// nothing here is drag-only and the keyboard route is unaffected. Dropping renders the excerpt
// client-side rather than navigating, because the drafting textarea may hold unsaved typing.
//
// Only one HTML5 drag can be in flight at a time, so the two halves below coordinate through a
// single module-level record rather than passing state through dataTransfer (which is
// deliberately unreadable during dragover, when we need to know whether to react).
let evidenceDrag = null

function initEvidenceDraggable (item) {
  const sourceId = item.dataset.dlpSourceId
  const target = querySelectorOrNull(item.dataset.dlpEvidenceTarget)
  if (!sourceId || !target) return

  item.addEventListener('dragstart', event => {
    const split = target.closest('[data-dlp-split]')

    evidenceDrag = {
      sourceId,
      target,
      split,
      // A panel revealed just to catch a drop should go back to closed if the drag is
      // abandoned — and must not be remembered as the user's chosen state either way.
      openedForDrag: Boolean(split) && target.hidden,
      dropped: false
    }

    if (evidenceDrag.openedForDrag) {
      split.dispatchEvent(new CustomEvent('dlp-split-open', { detail: { persist: false } }))
      target.classList.add('dlp-pw2-pane--dropzone')
    }

    item.classList.add('dlp-pw2-source--dragging')

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy'
      // Some browsers refuse to start a drag with nothing set.
      event.dataTransfer.setData('text/plain', sourceId)
    }
  })

  item.addEventListener('dragend', () => {
    item.classList.remove('dlp-pw2-source--dragging')

    if (evidenceDrag) {
      evidenceDrag.target.classList.remove('dlp-pw2-pane--dropzone', 'dlp-pw2-pane--dragover')
      if (evidenceDrag.openedForDrag && !evidenceDrag.dropped && evidenceDrag.split) {
        evidenceDrag.split.dispatchEvent(
          new CustomEvent('dlp-split-close', { detail: { pane: 'evidence', persist: false } }))
      }
    }

    evidenceDrag = null
  })
}

function initEvidenceDrop (pane) {
  const body = pane.querySelector('[data-dlp-evidence-body]')
  if (!body) return

  const sources = readJsonFrom(pane.dataset.dlpSourcesSource)
  const openLink = pane.querySelector('[data-dlp-evidence-open-link]')
  const sourceUrl = pane.dataset.dlpSourceUrl || ''

  // Mirrors policy-writing-v2/partials/evidence-document.html — change one and change the
  // other. The extracts are attached to each source by the route (see sourcesJson).
  function renderSource (source) {
    body.innerHTML = ''

    const article = document.createElement('article')
    article.className = 'dlp-pw2-evidence'

    const heading = document.createElement('h3')
    heading.className = 'dlp-pw2-evidence__title'
    heading.textContent = source.source || 'Untitled source'
    article.appendChild(heading)

    const extract = source.document || { section: source.ref || '', paragraphs: [] }

    if (extract.section) {
      const section = document.createElement('p')
      section.className = 'dlp-pw2-evidence__section'
      section.textContent = extract.section
      article.appendChild(section)
    }

    const list = document.createElement('ol')
    list.className = 'dlp-pw2-doc'

    ;(extract.paragraphs || []).forEach(paragraph => {
      const item = document.createElement('li')
      item.className = 'dlp-pw2-doc__para' + (paragraph.cited ? ' dlp-pw2-doc__para--cited' : '')

      const number = document.createElement('span')
      number.className = 'dlp-pw2-doc__number'
      number.setAttribute('aria-hidden', 'true')
      number.textContent = paragraph.number
      item.appendChild(number)

      const text = document.createElement('p')
      text.className = 'dlp-pw2-doc__text'

      // The numbers are decorative in the markup, so they have to be spoken here instead.
      const label = document.createElement('span')
      label.className = 'govuk-visually-hidden'
      label.textContent = (paragraph.cited ? 'Cited paragraph ' : 'Paragraph ') + paragraph.number + '. '
      text.appendChild(label)
      text.appendChild(document.createTextNode(paragraph.text || ''))

      item.appendChild(text)
      list.appendChild(item)
    })

    article.appendChild(list)

    if ((source.policyRefs || []).length) {
      const refs = document.createElement('p')
      refs.className = 'dlp-pw2-evidence__refs'
      source.policyRefs.forEach(ref => {
        const chip = document.createElement('span')
        chip.className = 'dlp-chip'
        chip.textContent = ref
        refs.appendChild(chip)
      })
      article.appendChild(refs)
    }

    body.appendChild(article)

    if (openLink) {
      openLink.href = sourceUrl + source.id
      openLink.hidden = false
    }

    // The reference flow marks paragraphs up when it is armed; this replaces them, so it has
    // to know to do that again.
    pane.dispatchEvent(new CustomEvent('dlp-evidence-rendered', { bubbles: true }))

    // Keep the rail's current-item marker in step with what the viewer is showing.
    document.querySelectorAll('[data-dlp-evidence-draggable]').forEach(item => {
      item.classList.toggle('dlp-pw2-source--current', item.dataset.dlpSourceId === source.id)
    })
  }

  pane.addEventListener('dragover', event => {
    if (!evidenceDrag) return
    // Without preventDefault the browser refuses the drop outright.
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
    pane.classList.add('dlp-pw2-pane--dragover')
  })

  pane.addEventListener('dragleave', event => {
    // Fires when moving between children too, so only react on actually leaving the pane.
    if (pane.contains(event.relatedTarget)) return
    pane.classList.remove('dlp-pw2-pane--dragover')
  })

  pane.addEventListener('drop', event => {
    event.preventDefault()
    pane.classList.remove('dlp-pw2-pane--dropzone', 'dlp-pw2-pane--dragover')

    const id = (evidenceDrag && evidenceDrag.sourceId) ||
      (event.dataTransfer && event.dataTransfer.getData('text/plain'))
    const source = sources.filter(candidate => candidate.id === id)[0]
    if (!source) return

    if (evidenceDrag) {
      evidenceDrag.dropped = true
      // Dropping something in is a decision to have the panel open, so unlike the temporary
      // reveal on dragstart, this one is remembered for next time.
      if (evidenceDrag.openedForDrag && evidenceDrag.split) {
        evidenceDrag.split.dispatchEvent(new CustomEvent('dlp-split-open'))
      }
    }

    renderSource(source)
  })
}

// Inserting a reference into the draft by pointing at the paragraph being cited.
//
// Three steps, across both panes: press the toolbar's reference control, click where the
// reference belongs in the draft, then click the paragraph in the evidence panel. The citation
// is written in full — "(Local Housing Needs Assessment, paragraph 3.3)" — rather than as a
// bare number, because the draft check looks for the document's name when deciding whether a
// source is cited. Insert one and the check agrees with you.
//
// The evidence paragraphs are only made interactive while the flow is armed. Outside it they
// are prose, and giving them a button role permanently would misdescribe them.
function initReferenceFlow (root) {
  const startButton = root.querySelector('[data-dlp-reference-start]')
  const status = root.querySelector('[data-dlp-reference-status]')
  const draft = querySelectorOrNull(root.dataset.dlpReferenceInput)
  const evidence = querySelectorOrNull(root.dataset.dlpReferenceEvidence)
  if (!startButton || !draft || !evidence) return

  let armed = false
  let caret = null

  function say (message) {
    if (!status) return
    status.textContent = message || ''
    status.hidden = !message
  }

  function paragraphs () {
    return Array.prototype.slice.call(evidence.querySelectorAll('.dlp-pw2-doc__para'))
  }

  // Read from the DOM rather than a data blob, so this keeps working for a paragraph the drag
  // handler rendered client-side as well as one the server rendered.
  function citationFor (paragraph) {
    const title = evidence.querySelector('.dlp-pw2-evidence__title')
    const numberEl = paragraph.querySelector('.dlp-pw2-doc__number')
    const number = numberEl ? numberEl.textContent.trim() : ''
    const document_ = title ? title.textContent.trim() : ''
    if (!document_) return ''

    // "policy H4" in the London Plan, "paragraph 3.3" in the studies.
    const label = /^[A-Za-z]/.test(number) ? 'policy' : 'paragraph'
    return number ? '(' + document_ + ', ' + label + ' ' + number + ')' : '(' + document_ + ')'
  }

  function markParagraphs (on) {
    paragraphs().forEach(paragraph => {
      if (on) {
        paragraph.setAttribute('role', 'button')
        paragraph.setAttribute('tabindex', '0')
        paragraph.setAttribute('aria-label', 'Insert reference to ' + citationFor(paragraph))
        paragraph.classList.add('dlp-pw2-doc__para--citable')
      } else {
        paragraph.removeAttribute('role')
        paragraph.removeAttribute('tabindex')
        paragraph.removeAttribute('aria-label')
        paragraph.classList.remove('dlp-pw2-doc__para--citable')
      }
    })
  }

  function setArmed (on) {
    armed = on
    startButton.setAttribute('aria-pressed', String(on))
    root.classList.toggle('dlp-pw2-main--citing', on)
    markParagraphs(on)

    if (!on) {
      caret = null
      say('')
      return
    }

    // Nothing to point at if the panel is shut, so open it — not persisted, since this is the
    // flow needing it rather than a choice about how to work.
    const split = evidence.closest('[data-dlp-split]')
    if (split && evidence.hidden) {
      split.dispatchEvent(new CustomEvent('dlp-split-open', { detail: { persist: false } }))
      markParagraphs(true)
    }

    caret = draft.selectionStart
    say('Click in your draft where the reference should go, then click the paragraph you are citing.')
  }

  function insert (paragraph) {
    const citation = citationFor(paragraph)
    if (!citation) return

    const value = draft.value
    const at = caret === null ? value.length : Math.min(caret, value.length)
    const before = value.slice(0, at)
    const after = value.slice(at)
    // Don't run the citation into the preceding word, and don't double a space that is there.
    const spacer = before && !/\s$/.test(before) ? ' ' : ''
    const text = spacer + citation

    draft.value = before + text + after
    setArmed(false)

    draft.focus()
    const caretAfter = at + text.length
    draft.setSelectionRange(caretAfter, caretAfter)
    say('Reference inserted: ' + citation)
  }

  startButton.addEventListener('click', () => setArmed(!armed))

  // Where the reference goes. Tracked on the draft's own events rather than a document-wide
  // click, so moving the caret with the keyboard counts too.
  ;['click', 'keyup', 'select'].forEach(type => {
    draft.addEventListener(type, () => {
      if (!armed) return
      caret = draft.selectionStart
      say('Now click the paragraph you are citing in the evidence panel.')
    })
  })

  // Delegated, so it survives the panel being re-rendered mid-flow.
  evidence.addEventListener('click', event => {
    if (!armed) return
    const paragraph = event.target.closest('.dlp-pw2-doc__para')
    if (!paragraph || !evidence.contains(paragraph)) return
    event.preventDefault()
    insert(paragraph)
  })

  evidence.addEventListener('keydown', event => {
    if (!armed || (event.key !== 'Enter' && event.key !== ' ')) return
    const paragraph = event.target.closest('.dlp-pw2-doc__para')
    if (!paragraph) return
    event.preventDefault()
    insert(paragraph)
  })

  evidence.addEventListener('dlp-evidence-rendered', () => {
    if (armed) markParagraphs(true)
  })

  document.addEventListener('keydown', event => {
    if (armed && event.key === 'Escape') {
      setArmed(false)
      say('')
      startButton.focus()
    }
  })
}

// --- Search suggestions ---------------------------------------------------------------------
//
// A combobox over a list of suggested terms, read from the JSON script that
// data-dlp-suggest-source points at ([{ term, kind, count }]). Choosing a suggestion puts it in
// the box and submits the box's form, so the results are an ordinary server-rendered page.
// Arrow keys move through the list (aria-activedescendant keeps focus in the input), Enter
// chooses, Escape closes. Unlike the evidence search modal's type-ahead this knows nothing about
// what the form does, so any GET search form can use it.
function initSuggestSearch (root) {
  const input = root.querySelector('[data-dlp-suggest-input]')
  const list = root.querySelector('[data-dlp-suggest-list]')
  const status = root.querySelector('[data-dlp-suggest-status]')
  const source = querySelectorOrNull(root.dataset.dlpSuggestSource)
  if (!input || !list || !source) return

  let terms = []
  try {
    terms = JSON.parse(source.textContent)
  } catch (error) {
    return
  }

  const maxShown = 8
  let options = []
  let active = -1

  function setStatus (message) {
    if (status) status.textContent = message
  }

  function close () {
    list.hidden = true
    list.innerHTML = ''
    options = []
    active = -1
    input.setAttribute('aria-expanded', 'false')
    input.removeAttribute('aria-activedescendant')
  }

  function highlight (index) {
    options.forEach((option, i) => {
      const isActive = i === index
      option.element.classList.toggle('dlp-suggest__option--active', isActive)
      option.element.setAttribute('aria-selected', String(isActive))
    })
    active = index
    if (index >= 0) {
      input.setAttribute('aria-activedescendant', options[index].element.id)
      options[index].element.scrollIntoView({ block: 'nearest' })
    } else {
      input.removeAttribute('aria-activedescendant')
    }
  }

  function choose (term) {
    input.value = term
    close()
    if (input.form) {
      if (input.form.requestSubmit) input.form.requestSubmit()
      else input.form.submit()
    }
  }

  // Matches anywhere in the term, but terms starting with what was typed come first, then
  // topics before individual sources, so "hous" offers "housing" before a document title.
  function matchesFor (typed) {
    const query = typed.toLowerCase()
    return terms
      .filter(option => option.term.toLowerCase().includes(query))
      .sort((a, b) => {
        const aStarts = a.term.toLowerCase().startsWith(query) ? 0 : 1
        const bStarts = b.term.toLowerCase().startsWith(query) ? 0 : 1
        if (aStarts !== bStarts) return aStarts - bStarts
        if (a.kind !== b.kind) return a.kind === 'Topic' ? -1 : 1
        return a.term.localeCompare(b.term)
      })
      .slice(0, maxShown)
  }

  function render () {
    const typed = input.value.trim()
    if (typed.length < 2) {
      close()
      setStatus('')
      return
    }

    const matches = matchesFor(typed)
    list.innerHTML = ''
    active = -1
    input.removeAttribute('aria-activedescendant')

    if (!matches.length) {
      close()
      setStatus('No suggested matches. Press Enter to search for ' + typed + '.')
      return
    }

    options = matches.map((match, index) => {
      const item = document.createElement('li')
      item.id = input.id + '-option-' + index
      item.className = 'dlp-typeahead__option dlp-suggest__option'
      item.setAttribute('role', 'option')
      item.setAttribute('aria-selected', 'false')

      const label = document.createElement('span')
      label.textContent = match.term
      item.appendChild(label)

      const kind = document.createElement('span')
      kind.className = 'dlp-typeahead__kind'
      kind.textContent = match.kind === 'Topic'
        ? match.count + ' source' + (match.count === 1 ? '' : 's')
        : 'Source'
      item.appendChild(kind)

      // mousedown rather than click, so choosing doesn't first blur the input and close the
      // list out from under the pointer.
      item.addEventListener('mousedown', event => {
        event.preventDefault()
        choose(match.term)
      })
      list.appendChild(item)
      return { element: item, term: match.term }
    })

    list.hidden = false
    input.setAttribute('aria-expanded', 'true')
    setStatus(matches.length + ' suggested match' + (matches.length === 1 ? '' : 'es') + '. Use the up and down arrows to choose.')
  }

  input.addEventListener('input', render)

  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
      if (list.hidden) render()
      if (!options.length) return
      event.preventDefault()
      highlight(active < options.length - 1 ? active + 1 : 0)
    } else if (event.key === 'ArrowUp') {
      if (!options.length) return
      event.preventDefault()
      highlight(active > 0 ? active - 1 : options.length - 1)
    } else if (event.key === 'Enter') {
      // With a suggestion highlighted, Enter chooses it; otherwise the form submits whatever
      // was typed, as a plain search box would.
      if (active >= 0) {
        event.preventDefault()
        choose(options[active].term)
      }
    } else if (event.key === 'Escape') {
      if (!list.hidden) {
        event.preventDefault()
        close()
      }
    }
  })

  input.addEventListener('blur', () => close())
}

// --- Submit a form when one of its fields changes ------------------------------------------
//
// For filter selects: the change applies at once instead of waiting for a button. The button
// stays in the markup for anyone without JavaScript.
function initAutosubmit (root) {
  root.addEventListener('change', event => {
    const form = event.target.form
    if (!form) return
    if (form.requestSubmit) form.requestSubmit()
    else form.submit()
  })
}

// --- Select all, with a running count ------------------------------------------------------
//
// Reveals a header checkbox that ticks every [data-dlp-select-all-item] in the root, keeps a
// "N selected" count, and disables [data-dlp-select-all-submit] until something is ticked.
function initSelectAll (root) {
  const items = Array.prototype.slice.call(root.querySelectorAll('[data-dlp-select-all-item]'))
  const toggle = root.querySelector('[data-dlp-select-all-toggle]')
  const control = root.querySelector('[data-dlp-select-all-control]')
  const fallback = root.querySelector('[data-dlp-select-all-fallback]')
  const count = root.querySelector('[data-dlp-select-all-count]')
  const submit = root.querySelector('[data-dlp-select-all-submit]')

  function update () {
    const selected = items.filter(item => item.checked).length
    if (count) {
      count.textContent = selected ? selected + ' selected' : 'None selected'
    }
    if (submit) submit.disabled = selected === 0
    if (toggle) {
      toggle.checked = items.length > 0 && selected === items.length
      toggle.indeterminate = selected > 0 && selected < items.length
    }
  }

  if (toggle && control && items.length) {
    control.hidden = false
    if (fallback) fallback.hidden = true
    toggle.addEventListener('change', () => {
      items.forEach(item => { item.checked = toggle.checked })
      update()
    })
  }

  items.forEach(item => item.addEventListener('change', update))
  // A reset button ("Clear selection") unticks everything without firing change events, and the
  // form's state only settles after the reset event itself, hence the deferral.
  const form = root.tagName === 'FORM' ? root : root.querySelector('form')
  if (form) form.addEventListener('reset', () => setTimeout(update))
  update()
}

// --- Fill a response from a chosen template --------------------------------------------------
//
// Choosing an option in [data-dlp-template-select] puts its data-text into the
// [data-dlp-template-text] textarea. "Write my own" (no data-text) clears the box only if it still
// holds a template's wording untouched, so it never throws away what someone has typed. The
// textarea's input event is fired so GOV.UK's character count keeps up.
function initTemplatePicker (root) {
  const select = root.querySelector('[data-dlp-template-select]')
  const textarea = root.querySelector('[data-dlp-template-text]')
  if (!select || !textarea) return

  const templateTexts = Array.prototype.map.call(select.options, option => option.dataset.text).filter(Boolean)

  select.addEventListener('change', () => {
    const option = select.options[select.selectedIndex]
    const text = option && option.dataset.text
    if (text) {
      textarea.value = text
    } else if (templateTexts.includes(textarea.value.trim())) {
      textarea.value = ''
    } else {
      return
    }
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
    textarea.dispatchEvent(new Event('keyup', { bubbles: true }))
  })
}
