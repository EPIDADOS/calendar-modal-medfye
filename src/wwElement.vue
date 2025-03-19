<template>
  <div class="activity-calendar" :style="calendarContainerStyle">
    <!-- Calendar Header -->
    <div class="calendar-header">
      <div class="calendar-title">
        <i class="calendar-icon">📅</i>
        <h2>{{ content.calendarTitle || 'Calendário de Atividades' }}</h2>
      </div>
      <div class="calendar-navigation">
        <button class="nav-button prev" @click="previousWeek">&lt;</button>
        <span class="date-range">{{ formattedDateRange }}</span>
        <button class="nav-button next" @click="nextWeek">&gt;</button>
      </div>
    </div>
    
    <!-- Calendar Grid - Desktop View (horizontal) -->
    <div class="calendar-grid desktop-view">
      <!-- Day Headers -->
      <div 
        v-for="day in visibleDays" 
        :key="`desktop-${day.dateStr}`"
        class="day-column" 
        :class="{ 'day-today': day.isToday, 'day-highlighted': day.date.getDay() === content.highlightedDay }"
      >
        <div class="day-header">
          <div class="day-name">{{ day.dayName }}</div>
          <div class="day-date">{{ day.dateStr }}</div>
        </div>
        
        <!-- Day Events -->
        <div class="day-events">
          <div 
            v-for="(event, eventIndex) in getEventsForDay(day.date)" 
            :key="`desktop-${day.dateStr}-${eventIndex}`"
            class="calendar-event"
            :style="getEventStyle(event)"
            @click="handleEventClick(event)"
          >
            <div class="event-color-bar" :style="{ backgroundColor: event.color || getCategoryColor(event.category) }"></div>
            <div class="event-content">
              <div class="event-title">
                {{ event.title }}
                <i v-if="event.important" class="event-star">★</i>
              </div>
              <div class="event-time">
                {{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}
                <span class="event-duration">({{ calculateDuration(event.startTime, event.endTime) }})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Calendar Grid - Mobile View (vertical) -->
    <div class="calendar-grid mobile-view">
      <div 
        v-for="day in visibleDays" 
        :key="`mobile-${day.dateStr}`"
        class="day-row" 
        :class="{ 'day-today': day.isToday, 'day-highlighted': day.date.getDay() === content.highlightedDay }"
      >
        <div class="day-header">
          <div class="day-name">{{ day.dayName }}</div>
          <div class="day-date">{{ day.dateStr }}</div>
        </div>
        
        <!-- Day Events -->
        <div class="day-events">
          <div 
            v-for="(event, eventIndex) in getEventsForDay(day.date)" 
            :key="`mobile-${day.dateStr}-${eventIndex}`"
            class="calendar-event"
            :style="getEventStyle(event)"
            @click="handleEventClick(event)"
          >
            <div class="event-color-bar" :style="{ backgroundColor: event.color || getCategoryColor(event.category) }"></div>
            <div class="event-content">
              <div class="event-title">
                {{ event.title }}
                <i v-if="event.important" class="event-star">★</i>
              </div>
              <div class="event-time">
                {{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}
                <span class="event-duration">({{ calculateDuration(event.startTime, event.endTime) }})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  props: {
    content: {
      type: Object,
      required: true
    },
    uid: {
      type: String,
      required: true
    },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },
  emits: ['trigger-event'],
  setup(props, { emit }) {
    // Current week start date (Monday)
    const currentWeekStart = ref(getMonday(new Date()));
    
    // Watch for changes in the initial date property
    watch(() => props.content.initialDate, (newValue) => {
      if (newValue) {
        try {
          const initialDate = new Date(newValue);
          if (!isNaN(initialDate.getTime())) {
            currentWeekStart.value = getMonday(initialDate);
          }
        } catch (error) {
          console.warn("Invalid initial date format", error);
        }
      }
    }, { immediate: true });
    
    // Format options
    const dateFormatter = new Intl.DateTimeFormat('pt-BR', { 
      day: 'numeric', 
      month: 'numeric' 
    });
    
    const dayFormatter = new Intl.DateTimeFormat('pt-BR', { 
      weekday: 'long' 
    });
    
    // Helper to get Monday of a given week
    function getMonday(date) {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      return new Date(d.setDate(diff));
    }
    
    // Calendar style based on properties
    const calendarContainerStyle = computed(() => {
      return {
        fontFamily: props.content.fontFamily || 'Arial, sans-serif',
        backgroundColor: props.content.backgroundColor || '#ffffff',
        borderRadius: props.content.borderRadius || '8px',
        boxShadow: props.content.showShadow ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
        border: props.content.borderWidth ? `${props.content.borderWidth}px solid ${props.content.borderColor || '#e0e0e0'}` : 'none'
      };
    });
    
    // Calculate visible days for the week
    const visibleDays = computed(() => {
      const days = [];
      const today = new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart.value);
        date.setDate(date.getDate() + i);
        
        // Get day name (Segunda, Terça, etc.)
        let dayName = dayFormatter.format(date);
        // Capitalize first letter
        dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        
        days.push({
          date: date,
          dayName: dayName,
          dateStr: dateFormatter.format(date).replace('/', '/'),
          isToday: isSameDay(date, today)
        });
      }
      
      return days;
    });
    
    // Format the date range for display (e.g., "13 - 19 de Março, 2025")
    const formattedDateRange = computed(() => {
      const start = visibleDays.value[0].date;
      const end = visibleDays.value[6].date;
      
      const startDay = start.getDate();
      const endDay = end.getDate();
      
      // Only show month and year once if in the same month
      if (start.getMonth() === end.getMonth()) {
        const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long' });
        const month = monthFormatter.format(start);
        return `${startDay} - ${endDay} de ${month.charAt(0).toUpperCase() + month.slice(1)}, ${start.getFullYear()}`;
      } else {
        const startFormatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' });
        const endFormatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        return `${startFormatter.format(start)} - ${endFormatter.format(end)}`;
      }
    });
    
    // Helper to format date for database query (YYYY-MM-DD)
    function formatDateForDatabase(date) {
      return date.toISOString().split('T')[0];
    }
    
    // Helper to format date to YYYY-MM-DD string
    function formatDateToYMD(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    
    // Navigation functions
    function previousWeek() {
      const newDate = new Date(currentWeekStart.value);
      newDate.setDate(newDate.getDate() - 7);
      currentWeekStart.value = newDate;
      
      const startDate = formatDateForDatabase(newDate);
      const endDate = formatDateForDatabase(getEndDate(newDate));
      
      emit('trigger-event', {
        name: 'dateChanged',
        event: { 
          startDate: startDate,
          endDate: endDate
        }
      });
    }
    
    function nextWeek() {
      const newDate = new Date(currentWeekStart.value);
      newDate.setDate(newDate.getDate() + 7);
      currentWeekStart.value = newDate;
      
      const startDate = formatDateForDatabase(newDate);
      const endDate = formatDateForDatabase(getEndDate(newDate));
      
      emit('trigger-event', {
        name: 'dateChanged',
        event: { 
          startDate: startDate,
          endDate: endDate
        }
      });
    }
    
    // Helper to get the end date (Sunday) from a start date (Monday)
    function getEndDate(startDate) {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      return endDate;
    }
    
    // Helper to check if two dates are the same day
    function isSameDay(date1, date2) {
      return date1.getDate() === date2.getDate() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getFullYear() === date2.getFullYear();
    }
    
    // Format time (from "09:00" string to formatted time)
    function formatTime(timeStr) {
      return timeStr;
    }
    
    // Calculate duration between two time strings
    function calculateDuration(startTime, endTime) {
      // Extract hours and minutes from time strings (format: "HH:MM")
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      // Calculate total minutes
      let totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
      
      // Handle negative durations (spanning multiple days)
      if (totalMinutes < 0) {
        totalMinutes += 24 * 60; // Add a full day
      }
      
      // Convert to hours and minutes
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      // Format the result
      if (hours === 0) {
        return `${minutes}m`;
      } else if (minutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h${minutes}`;
      }
    }
    
    // Handle event click - retorna todos os dados do evento
    function handleEventClick(event) {
      emit('trigger-event', {
        name: 'eventClicked',
        event: { 
          eventId: event.id || '',
          eventData: event.originalData || event
        }
      });
    }
    
    // FUNÇÃO CORRIGIDA: Filtra eventos para um dia específico
    function getEventsForDay(date) {
      // Verifica se temos dados da configuração
      if (!props.content.data || !Array.isArray(props.content.data)) {
        return [];
      }
      
      // Obtém a configuração de mapeamento de campos
      const titleField = props.content.titleField || 'title';
      const dateField = props.content.dateField || 'date';
      const startTimeField = props.content.startTimeField || 'startTime';
      const endTimeField = props.content.endTimeField || 'endTime';
      const categoryField = props.content.categoryField || 'category';
      const importantField = props.content.importantField || 'important';
      
      // Normaliza a data alvo para o formato YYYY-MM-DD sem componente de hora
      const targetDateStr = formatDateToYMD(date);
      
      // Filtra eventos para o dia atual
      let events = props.content.data.filter(event => {
        // Ignora filtragem se showEmptyDays for false
        if (!props.content.showEmptyDays && !event[dateField]) {
          return false;
        }
        
        // Analisa a data do evento usando o nome do campo configurado
        if (!event[dateField]) return false;
        
        // Extrai apenas a parte da data (YYYY-MM-DD) sem o componente de hora
        const eventDateStr = event[dateField].split('T')[0];
        
        // Compara as strings de data diretamente, sem criar objetos Date
        return eventDateStr === targetDateStr;
      });
      
      // Mapeia campos do banco de dados para campos do componente
      events = events.map(event => {
        return {
          title: event[titleField] || 'Evento sem título',
          date: event[dateField],
          startTime: event[startTimeField] || '00:00',
          endTime: event[endTimeField] || '00:00',
          category: event[categoryField] || 'default',
          important: !!event[importantField],
          color: event.color || null,
          id: event.id || null,
          originalData: event // Mantém os dados originais para o callback de clique no evento
        };
      });
      
      // Aplica ordenação com base na configuração
      const sortBy = props.content.sortBy || 'default';
      if (sortBy === 'startTime') {
        events.sort((a, b) => a.startTime.localeCompare(b.startTime));
      } else if (sortBy === 'title') {
        events.sort((a, b) => a.title.localeCompare(b.title));
      }
      
      return events;
    }
    
    // Get style for an event
    function getEventStyle(event) {
      return {
        opacity: event.important ? 1 : 0.9,
        backgroundColor: props.content.eventBackgroundColor || '#ffffff',
        cursor: 'pointer'
      };
    }
    
    // Get color for a category
    function getCategoryColor(category) {
      const categoryColors = {
        'revisao': '#f39c12', // orange
        'caso': '#9b59b6',    // purple
        'sistema': '#3498db', // blue
        'simulado': '#2ecc71', // green
        'questoes': '#e74c3c', // red
        'vias': '#1abc9c',    // teal
        'default': '#95a5a6'  // gray
      };
      
      // Custom category colors from configuration
      const customColors = props.content.categoryColors || {};
      
      if (category) {
        const lowerCategory = category.toLowerCase();
        
        // Check if there's a custom color defined
        if (customColors[lowerCategory]) {
          return customColors[lowerCategory];
        }
        
        // Check if there's a predefined color
        if (categoryColors[lowerCategory]) {
          return categoryColors[lowerCategory];
        }
      }
      
      return categoryColors.default;
    }
    
    return {
      visibleDays,
      formattedDateRange,
      previousWeek,
      nextWeek,
      getEventsForDay,
      formatTime,
      calculateDuration,
      getEventStyle,
      getCategoryColor,
      calendarContainerStyle,
      handleEventClick
    };
  }
};
</script>

<style lang="scss" scoped>
.activity-calendar {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    border-bottom: 1px solid #e0e0e0;
    
    @media (max-width: 600px) {
      flex-direction: column;
      gap: 10px;
      
      .calendar-title {
        width: 100%;
        justify-content: center;
      }
      
      .calendar-navigation {
        width: 100%;
        justify-content: center;
      }
    }
    
    .calendar-title {
      display: flex;
      align-items: center;
      
      .calendar-icon {
        margin-right: 8px;
        font-size: 20px;
      }
      
      h2 {
        margin: 0;
        font-size: 16px;
        font-weight: bold;
      }
    }
    
    .calendar-navigation {
      display: flex;
      align-items: center;
      
      .nav-button {
        width: 32px;
        height: 32px;
        background-color: transparent;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s;
        font-size: 16px;
        
        &:hover {
          background-color: #f5f5f5;
        }
      }
      
      .date-range {
        margin: 0 10px;
        font-size: 14px;
      }
    }
  }
  
  /* Desktop Calendar Grid (horizontal layout) */
  .calendar-grid.desktop-view {
    display: flex;
    flex: 1;
    overflow-y: auto;
    
    @media (max-width: 768px) {
      display: none; /* Hide on mobile */
    }
    
    .day-column {
      flex: 1;
      min-width: 100px;
      border-right: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      
      &:last-child {
        border-right: none;
      }
      
      &.day-today {
        background-color: rgba(0, 120, 255, 0.05);
        
        .day-header {
          background-color: rgba(0, 120, 255, 0.1);
          font-weight: bold;
        }
      }
      
      &.day-highlighted {
        background-color: rgba(0, 0, 0, 0.03);
      }
      
      .day-header {
        padding: 8px;
        text-align: center;
        background-color: #f8f9fa;
        border-bottom: 1px solid #e0e0e0;
        
        .day-name {
          font-weight: 500;
          font-size: 14px;
        }
        
        .day-date {
          font-size: 12px;
          color: #666;
        }
      }
      
      .day-events {
        padding: 6px;
        overflow-y: auto;
        flex: 1;
      }
    }
  }
  
  /* Mobile Calendar Grid (vertical layout) */
  .calendar-grid.mobile-view {
    display: none; /* Hide on desktop */
    flex: 1;
    flex-direction: column;
    overflow-y: auto;
    
    @media (max-width: 768px) {
      display: flex; /* Show on mobile */
    }
    
    .day-row {
      width: 100%;
      border-bottom: 1px solid #e0e0e0;
      
      &:last-child {
        border-bottom: none;
      }
      
      &.day-today {
        background-color: rgba(0, 120, 255, 0.05);
        
        .day-header {
          background-color: rgba(0, 120, 255, 0.1);
          font-weight: bold;
        }
      }
      
      &.day-highlighted {
        background-color: rgba(0, 0, 0, 0.03);
      }
      
      .day-header {
        padding: 10px;
        background-color: #f8f9fa;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .day-name {
          font-weight: 500;
          font-size: 16px;
        }
        
        .day-date {
          font-size: 14px;
          color: #666;
        }
      }
      
      .day-events {
        padding: 8px;
      }
    }
  }
  
  /* Common event styles for both views */
  .calendar-event {
    display: flex;
    margin-bottom: 8px;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    position: relative;
    transition: transform 0.1s ease;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    }
    
    .event-color-bar {
      width: 4px;
      flex-shrink: 0;
    }
    
    .event-content {
      padding: 6px 8px;
      flex: 1;
      min-width: 0;
      
      .event-title {
        font-size: 12px;
        font-weight: 500;
        margin-bottom: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        @media (max-width: 768px) {
          font-size: 14px; /* Larger text on mobile */
        }
        
        .event-star {
          color: #f1c40f;
          font-size: 14px;
          
          @media (max-width: 768px) {
            font-size: 16px; /* Larger star on mobile */
          }
        }
      }
      
      .event-time {
        font-size: 11px;
        color: #666;
        
        @media (max-width: 768px) {
          font-size: 13px; /* Larger text on mobile */
        }
        
        .event-duration {
          color: #888;
          margin-left: 2px;
        }
      }
    }
  }
}
</style>