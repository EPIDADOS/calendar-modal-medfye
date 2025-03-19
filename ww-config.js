export default {
  editor: {
    label: {
      en: 'Activity Calendar',
      pt: 'Calendário de Atividades',
    },
    icon: 'calendar',
  },
  properties: {
    // Mode selector - similar to the screenshot
    mode: {
      label: {
        en: 'Mode',
        pt: 'Modo',
      },
      type: 'TextSelect',
      options: {
        options: [
          { value: 'guided', label: { en: 'Guided', pt: 'Guiado' } },
          { value: 'advanced', label: { en: 'Advanced', pt: 'Avançado' } },
        ],
      },
      section: 'specific',
      defaultValue: 'guided',
      bindable: false,
    },

    // Data source configuration
    data: {
      label: {
        en: 'Data',
        pt: 'Dados',
      },
      type: 'Array',
      section: 'specific',
      defaultValue: [],
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip:
          'Bind to a collection or query result containing calendar events',
      },
      propertyHelp: {
        tooltip: 'Connect to a database query returning calendar events',
      },
      /* wwEditor:end */
    },

    // Field mapping - similar to X-axis in screenshot
    titleField: {
      label: {
        en: 'Title field',
        pt: 'Campo de título',
      },
      type: 'Text',
      section: 'specific',
      defaultValue: 'title',
      bindable: true,
    },

    dateField: {
      label: {
        en: 'Date field',
        pt: 'Campo de data',
      },
      type: 'Text',
      section: 'specific',
      defaultValue: 'date',
      bindable: true,
    },

    startTimeField: {
      label: {
        en: 'Start time field',
        pt: 'Campo de hora inicial',
      },
      type: 'Text',
      section: 'specific',
      defaultValue: 'startTime',
      bindable: true,
    },

    endTimeField: {
      label: {
        en: 'End time field',
        pt: 'Campo de hora final',
      },
      type: 'Text',
      section: 'specific',
      defaultValue: 'endTime',
      bindable: true,
    },

    categoryField: {
      label: {
        en: 'Category field',
        pt: 'Campo de categoria',
      },
      type: 'Text',
      section: 'specific',
      defaultValue: 'category',
      bindable: true,
    },

    importantField: {
      label: {
        en: 'Important field',
        pt: 'Campo de importância',
      },
      type: 'Text',
      section: 'specific',
      defaultValue: 'important',
      bindable: true,
    },

    // Similar to "Order by" in the screenshot
    sortBy: {
      label: {
        en: 'Sort by',
        pt: 'Ordenar por',
      },
      type: 'TextRadioGroup',
      options: {
        choices: [
          { value: 'default', title: 'Default' },
          { value: 'startTime', title: 'Start Time' },
          { value: 'title', title: 'Title' },
        ],
      },
      section: 'specific',
      defaultValue: 'default',
      bindable: true,
    },

    // Similar to "Include empty values" in the screenshot
    showEmptyDays: {
      label: {
        en: 'Show empty days',
        pt: 'Mostrar dias vazios',
      },
      type: 'OnOff',
      section: 'specific',
      defaultValue: true,
      bindable: true,
    },

    // Calendar display configuration - moved to a separate section
    calendarTitle: {
      label: {
        en: 'Calendar Title',
        pt: 'Título do Calendário',
      },
      type: 'Text',
      section: 'content',
      defaultValue: 'Calendário de Atividades',
      bindable: true,
    },

    initialDate: {
      label: {
        en: 'Initial Date',
        pt: 'Data Inicial',
      },
      type: 'Text',
      section: 'content',
      defaultValue: new Date().toISOString().split('T')[0],
      bindable: true,
    },

    highlightedDay: {
      label: {
        en: 'Highlighted Day (0-6)',
        pt: 'Dia Destacado (0-6)',
      },
      type: 'Number',
      section: 'content',
      defaultValue: 4, // Default to Thursday (4)
      bindable: true,
      options: {
        min: 0,
        max: 6,
      },
    },

    // Custom category colors - moved to style section
    categoryColors: {
      label: {
        en: 'Category Colors',
        pt: 'Cores das Categorias',
      },
      type: 'Object',
      section: 'style',
      defaultValue: {
        revisao: '#f39c12',
        caso: '#9b59b6',
        sistema: '#3498db',
        simulado: '#2ecc71',
        questoes: '#e74c3c',
        vias: '#1abc9c',
      },
      bindable: true,
    },

    // Visual customization
    fontFamily: {
      label: {
        en: 'Font Family',
        pt: 'Família de Fonte',
      },
      type: 'Text',
      section: 'style',
      defaultValue: 'Arial, sans-serif',
      bindable: true,
    },

    backgroundColor: {
      label: {
        en: 'Background Color',
        pt: 'Cor de Fundo',
      },
      type: 'Color',
      section: 'style',
      defaultValue: '#ffffff',
      bindable: true,
    },

    eventBackgroundColor: {
      label: {
        en: 'Event Background Color',
        pt: 'Cor de Fundo do Evento',
      },
      type: 'Color',
      section: 'style',
      defaultValue: '#ffffff',
      bindable: true,
    },

    borderRadius: {
      label: {
        en: 'Border Radius',
        pt: 'Raio da Borda',
      },
      type: 'Text',
      section: 'style',
      defaultValue: '8px',
      bindable: true,
    },

    showShadow: {
      label: {
        en: 'Show Shadow',
        pt: 'Mostrar Sombra',
      },
      type: 'OnOff',
      section: 'style',
      defaultValue: true,
      bindable: true,
    },

    borderWidth: {
      label: {
        en: 'Border Width',
        pt: 'Largura da Borda',
      },
      type: 'Number',
      section: 'style',
      defaultValue: 1,
      bindable: true,
    },

    borderColor: {
      label: {
        en: 'Border Color',
        pt: 'Cor da Borda',
      },
      type: 'Color',
      section: 'style',
      defaultValue: '#e0e0e0',
      bindable: true,
    },
  },
  triggerEvents: [
    {
      name: 'dateChanged',
      label: {
        en: 'Date Range Changed',
        pt: 'Intervalo de Data Alterado',
      },
      event: { startDate: '', endDate: '' },
    },
    {
      name: 'eventClicked',
      label: {
        en: 'Event Clicked',
        pt: 'Evento Clicado',
      },
      event: { eventId: '', eventData: {} },
    },
  ],
  actions: [
    {
      action: 'previousWeek',
      label: {
        en: 'Go to Previous Week',
        pt: 'Ir para Semana Anterior',
      },
    },
    {
      action: 'nextWeek',
      label: {
        en: 'Go to Next Week',
        pt: 'Ir para Próxima Semana',
      },
    },
  ],
};
