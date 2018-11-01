// 标签
const add = [
  // {
  //   field: "label",
  //   rules: [
  //     {
  //       require: true,
  //       message: "label必填"
  //     }
  //   ]
  // }
];

const update = [
  {
    field: "id",
    rules: [
      {
        sysErr:true,
        require: true,
        message: "id必传"
      }
    ]
  }
];
const del = [
  {
    field: "id",
    rules: [
      {
        sysErr:true,
        require: true,
        message: "id必传"
      }
    ]
  }
];

export { add, update, del };
