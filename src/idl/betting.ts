export const IDL = {
  version: "0.1.0",
  name: "betting",
  instructions: [
    {
      name: "createEvent",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "event",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "teamA",
          type: "string",
        },
        {
          name: "teamB",
          type: "string",
        },
        {
          name: "startTime",
          type: "i64",
        },
        {
          name: "oddsA",
          type: "u64",
        },
        {
          name: "oddsB",
          type: "u64",
        },
        {
          name: "description",
          type: "string",
        },
        {
          name: "category",
          type: "string",
        },
      ],
    },
    {
      name: "updateEvent",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "event",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "name",
          type: {
            option: "string",
          },
        },
        {
          name: "description",
          type: {
            option: "string",
          },
        },
        {
          name: "startTime",
          type: {
            option: "i64",
          },
        },
        {
          name: "oddsA",
          type: {
            option: "u64",
          },
        },
        {
          name: "oddsB",
          type: {
            option: "u64",
          },
        },
        {
          name: "status",
          type: {
            option: "string",
          },
        },
      ],
    },
    {
      name: "placeBet",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "event",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bet",
          isMut: true,
          isSigner: true,
        },
        {
          name: "userTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "eventTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
        {
          name: "team",
          type: "string",
        },
      ],
    },
    {
      name: "settleEvent",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "event",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "winningTeam",
          type: "string",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "Event",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "name",
            type: "string",
          },
          {
            name: "teamA",
            type: "string",
          },
          {
            name: "teamB",
            type: "string",
          },
          {
            name: "startTime",
            type: "i64",
          },
          {
            name: "oddsA",
            type: "u64",
          },
          {
            name: "oddsB",
            type: "u64",
          },
          {
            name: "description",
            type: "string",
          },
          {
            name: "category",
            type: "string",
          },
          {
            name: "status",
            type: "string",
          },
          {
            name: "tokenA",
            type: "publicKey",
          },
          {
            name: "tokenB",
            type: "publicKey",
          },
          {
            name: "winningTeam",
            type: {
              option: "string",
            },
          },
          {
            name: "createdAt",
            type: "i64",
          },
        ],
      },
    },
    {
      name: "Bet",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "event",
            type: "publicKey",
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "team",
            type: "string",
          },
          {
            name: "createdAt",
            type: "i64",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "Unauthorized",
      msg: "You are not authorized to perform this action",
    },
    {
      code: 6001,
      name: "EventNotActive",
      msg: "Event is not active",
    },
  ],
};
