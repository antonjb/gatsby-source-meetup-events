const axios = require("axios");

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;

  createTypes(`
    type Event implements Node {
        created: Date @dateformat
        date_in_series_pattern: Boolean
        description: String
        duration: Int
        fee: Fee
        group: MeetupGroup
        id: String
        link: String
        local_date: Date @dateformat
        local_time: String
        name: String
        rsvp_close_offset: String
        rsvp_limit: Int
        status: String
        time: Date @dateformat
        updated: Date @dateformat
        utc_offset: Int
        venue: Venue
        visibility: String
        waitlist_count: Int
        yes_rsvp_count: Int
    }

    type EventContext implements Node {
        host: Boolean
    }

    type Fee implements Node {
        accepts: String
        amount: Float
        currency: String
        description: String
        label: String
        required: Boolean
    }

    type MeetupGroup implements Node {
        created: Date @dateformat
        name: String
        id: Int
        join_mode: String
        lat: Float
        lon: Float
        urlname: String
        who: String
        localized_location: String
        state: String
        country: String
        region: String
        timezone: String
    }

    type MeetupPhotoObject implements Node {
        id: Int
        highres_link: String
        photo_link: String
        thumb_link: String
        type: String
        base_url: String
    }

    type Venue implements Node {
        address_1: String
        address_2: String
        address_3: String
        city: String
        country: String
        id: Int
        lat: Float
        localized_country_name: String
        lon: Float
        name: String
        phone: String
        repinned: Boolean
        state: String
        zip: String
    }
    `);
};

exports.sourceNodes = async (
  { actions, createNodeId, createContentDigest, reporter },
  { groupId }
) => {
  const { createNode } = actions;

  if (!groupId) {
    reporter.panic(
      "Please define an groupId param to gatsby-source-meetup-events"
    );
  }

  const axiosClient = axios.create({
    baseURL: "https://api.meetup.com/"
  });

  try {
    const { data } = await axiosClient.get(`${groupId}/events`);

    data.forEach(event => {
      createNode({
        ...event,
        id: createNodeId(event.id),
        parent: null,
        children: [],
        internal: {
          type: "Event",
          content: JSON.stringify(event),
          contentDigest: createContentDigest(event)
        }
      });
    });
  } catch (err) {
    reporter.panicOnBuild("Error creating Meetup events.");
  }
};
